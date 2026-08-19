import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';
import * as studentService from './studentService';

export interface SubmitLeadInput {
  firstName: string;
  phone: string;
}

export interface ListLeadsQuery {
  completed?: boolean;
}

export async function submitLead(input: SubmitLeadInput) {
  const { firstName, phone } = input;
  if (!firstName || !phone) {
    throw new ApiError(400, 'INVALID_INPUT', 'firstName and phone are required.');
  }

  const { rows } = await pool.query(
    `insert into public.student_leads (first_name, phone)
     values ($1, $2)
     returning id, first_name, phone, submitted_at, completed, student_id`,
    [firstName, phone],
  );
  return rows[0];
}

export async function listLeads(query: ListLeadsQuery = {}) {
  const completed = query.completed ?? false;
  const { rows } = await pool.query(
    `select id, first_name, phone, submitted_at, completed, student_id
     from public.student_leads
     where completed = $1
     order by submitted_at asc`,
    [completed],
  );
  return rows;
}

export async function completeLead(
  id: string,
  input: studentService.CreateStudentInput,
  actingUser: studentService.ActingUser,
) {
  return withUserContext(actingUser.id, async (client) => {
    // Lock the lead row for the duration of this transaction so a concurrent
    // completeLead call on the same lead can't also pass this check before
    // either commits — without this, two near-simultaneous requests could
    // both see completed = false and each create a student.
    const { rows } = await client.query(
      `select id, completed from public.student_leads where id = $1 for update`,
      [id],
    );
    const lead = rows[0];
    if (!lead) {
      throw new ApiError(404, 'NOT_FOUND', 'Lead not found.');
    }
    if (lead.completed) {
      throw new ApiError(409, 'ALREADY_COMPLETED', 'This lead has already been completed.');
    }

    // Runs in this same transaction — if either this insert or the lead
    // update below fails, both roll back together. Previously these were
    // two separate transactions: a crash in between left a student created
    // but the lead still marked incomplete, so retrying "Complete" would
    // create a second, duplicate student for the same person.
    const student = await studentService.insertStudentRow(client, input, actingUser);

    await client.query(
      `update public.student_leads set completed = true, student_id = $1 where id = $2`,
      [student.id, id],
    );

    return student;
  });
}
