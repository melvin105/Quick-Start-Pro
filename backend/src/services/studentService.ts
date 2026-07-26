import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';
import { normalizeNumericFields, normalizeNumericRows } from '../utils/normalizeNumeric';

const STUDENT_BALANCE_FIELDS = ['total_fees', 'total_paid', 'balance'] as const;

const GENDERS = ['male', 'female'] as const;
const STUDENT_STATUSES = ['active', 'completed', 'suspended', 'withdrawn', 'archived'] as const;
const ENROLMENT_TYPES = ['driving_only', 'licence_only', 'driving_and_licence'] as const;
const EXAM_RESULTS = ['pending', 'passed', 'failed'] as const;

type Gender = (typeof GENDERS)[number];
type StudentStatus = (typeof STUDENT_STATUSES)[number];
type EnrolmentType = (typeof ENROLMENT_TYPES)[number];
type ExamResult = (typeof EXAM_RESULTS)[number];

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  ghanaCardNo?: string;
  photoUrl?: string;
  enrolmentType: string;
  packageId?: string;
  confirmDifferentPerson?: boolean;
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  ghanaCardNo?: string;
  photoUrl?: string;
  status?: string;
  enrolmentType?: string;
}

export interface ListStudentsQuery {
  search?: string;
  status?: string;
  enrolmentType?: string;
  page?: number;
  limit?: number;
}

export interface UpsertLicenceInput {
  eyeTestDone?: boolean;
  eyeTestDate?: string;
  learnerLicenceIssued?: boolean;
  learnerLicenceDate?: string;
  examDate?: string;
  examResult?: string;
  licenceIssued?: boolean;
  licenceIssuedDate?: string;
  remarks?: string;
}

export interface ActingUser {
  id: string;
  role: 'manager' | 'secretary';
}

function assertGender(gender: string): asserts gender is Gender {
  if (!(GENDERS as readonly string[]).includes(gender)) {
    throw new ApiError(400, 'INVALID_INPUT', `gender must be one of: ${GENDERS.join(', ')}`);
  }
}

function assertEnrolmentType(value: string): asserts value is EnrolmentType {
  if (!(ENROLMENT_TYPES as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `enrolmentType must be one of: ${ENROLMENT_TYPES.join(', ')}`);
  }
}

function assertStatus(value: string): asserts value is StudentStatus {
  if (!(STUDENT_STATUSES as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `status must be one of: ${STUDENT_STATUSES.join(', ')}`);
  }
}

function assertExamResult(value: string): asserts value is ExamResult {
  if (!(EXAM_RESULTS as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `examResult must be one of: ${EXAM_RESULTS.join(', ')}`);
  }
}

async function findPossibleDuplicate(firstName: string, lastName: string, phone: string) {
  const { rows } = await pool.query(
    `select id, student_number, first_name, last_name, phone
     from public.students
     where phone = $1
        or (lower(first_name) = lower($2) and lower(last_name) = lower($3))
     limit 1`,
    [phone, firstName, lastName],
  );
  return rows[0] ?? null;
}

// Core insert logic, runnable inside a caller-supplied transaction. Exported
// so leadService.completeLead can run this AND its lead-completion update in
// one shared transaction — otherwise a failure between the two would leave
// a student created but its originating lead still marked incomplete,
// letting the lead be "completed" again and creating a duplicate student.
export async function insertStudentRow(
  client: import('pg').PoolClient,
  input: CreateStudentInput,
  actingUser: ActingUser,
) {
  const {
    firstName, lastName, gender, dob, phone, email, address, emergencyContact,
    ghanaCardNo, photoUrl, enrolmentType, packageId, confirmDifferentPerson,
  } = input;

  if (!firstName || !lastName || !phone || !dob) {
    throw new ApiError(400, 'INVALID_INPUT', 'firstName, lastName, dob and phone are required.');
  }
  assertGender(gender);
  assertEnrolmentType(enrolmentType);

  const duplicate = await findPossibleDuplicate(firstName, lastName, phone);
  if (duplicate && !confirmDifferentPerson) {
    throw new ApiError(409, 'POSSIBLE_DUPLICATE', 'A student with a matching name or phone number already exists.');
  }

  const { rows } = await client.query(
    `insert into public.students
       (first_name, last_name, gender, dob, phone, email, address,
        emergency_contact, ghana_card_no, photo_url, enrolment_type)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     returning id, student_number`,
    [firstName, lastName, gender, dob, phone, email ?? null, address ?? null,
      emergencyContact ?? null, ghanaCardNo ?? null, photoUrl ?? null, enrolmentType],
  );
  const student = rows[0];

  if (packageId) {
    await client.query(
      `insert into public.student_packages (student_id, package_id) values ($1, $2)`,
      [student.id, packageId],
    );
  }

  if (duplicate && confirmDifferentPerson && actingUser.role === 'secretary') {
    await client.query(
      `insert into public.notifications (recipient_role, type, title, body, link_url)
       values ('manager', 'audit_alert', 'Duplicate warning overridden at registration',
               $1, $2)`,
      [
        `${firstName} ${lastName} (${phone}) was registered despite matching an existing record (${duplicate.first_name} ${duplicate.last_name}, ${duplicate.student_number}).`,
        `/students/${student.id}`,
      ],
    );
  }

  const profile = await client.query(`select * from public.v_student_profile where id = $1`, [student.id]);
  return normalizeNumericFields(profile.rows[0], STUDENT_BALANCE_FIELDS);
}

export async function createStudent(input: CreateStudentInput, actingUser: ActingUser) {
  return withUserContext(actingUser.id, (client) => insertStudentRow(client, input, actingUser));
}

export async function listStudents(query: ListStudentsQuery) {
  const { search, status, enrolmentType } = query;
  if (status) assertStatus(status);
  if (enrolmentType) assertEnrolmentType(enrolmentType);

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`s.status = $${params.length}`);
  }
  if (enrolmentType) {
    params.push(enrolmentType);
    conditions.push(`s.enrolment_type = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    const p = params.length;
    conditions.push(
      `(s.first_name || ' ' || s.last_name ilike $${p} or s.phone ilike $${p} or s.student_number ilike $${p})`,
    );
  }

  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';

  const { rows: countRows } = await pool.query(
    `select count(*)::int as total from public.students s ${where}`,
    params,
  );
  const total = countRows[0].total;

  params.push(limit, offset);
  const { rows } = await pool.query(
    `select
       s.id, s.student_number, s.first_name, s.last_name, s.gender, s.phone,
       s.email, s.status, s.enrolment_type, s.registration_date, s.photo_url,
       coalesce(vb.total_fees, 0) as total_fees,
       coalesce(vb.total_paid, 0) as total_paid,
       coalesce(vb.balance, 0)    as balance,
       pkg.package_name
     from public.students s
     left join public.v_student_balances vb on vb.id = s.id
     left join lateral (
       select dp.package_name
       from public.student_packages sp
       join public.driving_packages dp on dp.id = sp.package_id
       where sp.student_id = s.id
       order by sp.assigned_date desc, sp.created_at desc
       limit 1
     ) pkg on true
     ${where}
     order by s.created_at desc
     limit $${params.length - 1} offset $${params.length}`,
    params,
  );

  return { students: normalizeNumericRows(rows, STUDENT_BALANCE_FIELDS), total, page, limit };
}

export async function getStudentById(id: string) {
  const { rows } = await pool.query(`select * from public.v_student_profile where id = $1`, [id]);
  if (!rows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Student not found.');
  }
  return normalizeNumericFields(rows[0], STUDENT_BALANCE_FIELDS);
}

export async function updateStudent(id: string, input: UpdateStudentInput, actingUser: ActingUser) {
  if (input.gender) assertGender(input.gender);
  if (input.status) assertStatus(input.status);
  if (input.enrolmentType) assertEnrolmentType(input.enrolmentType);

  const fieldMap: Record<string, unknown> = {
    first_name: input.firstName,
    last_name: input.lastName,
    gender: input.gender,
    dob: input.dob,
    phone: input.phone,
    email: input.email,
    address: input.address,
    emergency_contact: input.emergencyContact,
    ghana_card_no: input.ghanaCardNo,
    photo_url: input.photoUrl,
    status: input.status,
    enrolment_type: input.enrolmentType,
  };

  const setClauses: string[] = [];
  const params: unknown[] = [];
  for (const [column, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      params.push(value);
      setClauses.push(`${column} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'No updatable fields provided.');
  }

  return withUserContext(actingUser.id, async (client) => {
    params.push(id);
    const { rows } = await client.query(
      `update public.students set ${setClauses.join(', ')} where id = $${params.length} returning id`,
      params,
    );
    if (!rows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'Student not found.');
    }
    const profile = await client.query(`select * from public.v_student_profile where id = $1`, [id]);
    return normalizeNumericFields(profile.rows[0], STUDENT_BALANCE_FIELDS);
  });
}

const SELECT_LICENCE = `select * from public.licence_tracking where student_id = $1`;

export async function upsertLicence(studentId: string, input: UpsertLicenceInput, actingUser: ActingUser) {
  if (input.examResult) assertExamResult(input.examResult);

  const fieldMap: Record<string, unknown> = {
    eye_test_done: input.eyeTestDone,
    eye_test_date: input.eyeTestDate,
    learner_licence_issued: input.learnerLicenceIssued,
    learner_licence_date: input.learnerLicenceDate,
    exam_date: input.examDate,
    exam_result: input.examResult,
    licence_issued: input.licenceIssued,
    licence_issued_date: input.licenceIssuedDate,
    remarks: input.remarks,
  };

  const columns = Object.entries(fieldMap).filter(([, value]) => value !== undefined);
  if (columns.length === 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'No updatable licence fields provided.');
  }

  return withUserContext(actingUser.id, async (client) => {
    const { rows: studentRows } = await client.query(`select id from public.students where id = $1`, [studentId]);
    if (!studentRows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'Student not found.');
    }

    const { rows: existingRows } = await client.query(
      `select id from public.licence_tracking where student_id = $1`,
      [studentId],
    );

    if (existingRows[0]) {
      const params: unknown[] = [];
      const setClauses = columns.map(([column, value]) => {
        params.push(value);
        return `${column} = $${params.length}`;
      });
      params.push(actingUser.id);
      setClauses.push(`updated_by = $${params.length}`);
      params.push(studentId);
      await client.query(
        `update public.licence_tracking set ${setClauses.join(', ')} where student_id = $${params.length}`,
        params,
      );
    } else {
      const params: unknown[] = [studentId, actingUser.id];
      const insertColumns = ['student_id', 'updated_by', ...columns.map(([column]) => column)];
      const values = columns.map(([, value]) => {
        params.push(value);
        return `$${params.length}`;
      });
      await client.query(
        `insert into public.licence_tracking (${insertColumns.join(', ')})
         values ($1, $2, ${values.join(', ')})`,
        params,
      );
    }

    const { rows } = await client.query(SELECT_LICENCE, [studentId]);
    return rows[0];
  });
}
