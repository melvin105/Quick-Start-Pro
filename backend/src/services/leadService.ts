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
  const { rows } = await pool.query(
    `select id, completed from public.student_leads where id = $1`,
    [id],
  );
  const lead = rows[0];
  if (!lead) {
    throw new ApiError(404, 'NOT_FOUND', 'Lead not found.');
  }
  if (lead.completed) {
    throw new ApiError(409, 'ALREADY_COMPLETED', 'This lead has already been completed.');
  }

  const student = await studentService.createStudent(input, actingUser);

  return withUserContext(actingUser.id, async (client) => {
    await client.query(
      `update public.student_leads set completed = true, student_id = $1 where id = $2`,
      [student.id, id],
    );
    return student;
  });
}
