import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';
import * as studentService from './studentService';
import { assertRegistrationToken } from './publicTokenService';

const GENDERS = ['male', 'female'] as const;
const REGISTRATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface NextOfKinInput {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface EmergencyContactInput {
  name: string;
  phone: string;
  relationship: string;
}

// Mirrors the frontend PendingSubmission (minus server-derived fields).
// Self-registration covers only what the student knows — enrolment/package
// is added by staff at approval time.
export interface SubmitRegistrationInput {
  sessionToken: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  photo?: string;
  idCardType?: string;
  idCardNumber?: string;
  nextOfKin?: NextOfKinInput;
  emergencyContact?: EmergencyContactInput;
}

// Staff-supplied enrolment details at approval (the "Step 4" desk decision).
export interface ApproveRegistrationInput {
  enrolmentType: string;
  packageId?: string;
  confirmDifferentPerson?: boolean;
}

export interface ActingUser {
  id: string;
  role: 'manager' | 'secretary';
}

export interface ListRegistrationsQuery {
  status?: string;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ApiError(400, 'INVALID_INPUT', `${field} is required.`);
  }
  return value.trim();
}

function optionalString(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') {
    throw new ApiError(400, 'INVALID_INPUT', 'Expected a string value.');
  }
  return value.trim();
}

const REGISTRATION_SELECT = `
  select id, first_name, last_name, dob, gender, phone, email, address, photo_url,
         id_card_type, id_card_number, nok_name, nok_relationship, nok_phone, nok_email,
         ec_name, ec_phone, ec_relationship, status, student_id, rejection_reason,
         reviewed_by, reviewed_at, submitted_at, created_at
  from public.student_registrations`;

/**
 * Public, unauthenticated full self-registration. Stores the submission in the
 * pending queue; a normal student record is only created later on approval.
 */
export async function submitRegistration(input: SubmitRegistrationInput) {
  const firstName = requireString(input?.firstName, 'firstName');
  const lastName = requireString(input?.lastName, 'lastName');
  const phone = requireString(input?.phone, 'phone');
  assertRegistrationToken(input?.sessionToken, phone);
  const dob = requireString(input?.dob, 'dob');
  if (!DATE_RE.test(dob)) {
    throw new ApiError(400, 'INVALID_INPUT', 'dob must be in YYYY-MM-DD format.');
  }

  const gender = requireString(input?.gender, 'gender');
  if (!(GENDERS as readonly string[]).includes(gender)) {
    throw new ApiError(400, 'INVALID_INPUT', `gender must be one of: ${GENDERS.join(', ')}`);
  }

  const email = optionalString(input?.email);
  if (email && !EMAIL_RE.test(email)) {
    throw new ApiError(400, 'INVALID_INPUT', 'email must be a valid email address.');
  }

  // Next of kin and emergency contact are required by the registration form.
  const nok = input?.nextOfKin ?? ({} as NextOfKinInput);
  const nokName = requireString(nok.name, 'nextOfKin.name');
  const nokRelationship = requireString(nok.relationship, 'nextOfKin.relationship');
  const nokPhone = requireString(nok.phone, 'nextOfKin.phone');
  const nokEmail = optionalString(nok.email);
  if (nokEmail && !EMAIL_RE.test(nokEmail)) {
    throw new ApiError(400, 'INVALID_INPUT', 'nextOfKin.email must be a valid email address.');
  }

  const ec = input?.emergencyContact ?? ({} as EmergencyContactInput);
  const ecName = requireString(ec.name, 'emergencyContact.name');
  const ecPhone = requireString(ec.phone, 'emergencyContact.phone');
  const ecRelationship = requireString(ec.relationship, 'emergencyContact.relationship');

  const { rows } = await pool.query(
    `insert into public.student_registrations
       (first_name, last_name, dob, gender, phone, email, address, photo_url,
        id_card_type, id_card_number, nok_name, nok_relationship, nok_phone, nok_email,
        ec_name, ec_phone, ec_relationship)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     returning id, status, submitted_at`,
    [
      firstName, lastName, dob, gender, phone, email, optionalString(input?.address),
      optionalString(input?.photo), optionalString(input?.idCardType), optionalString(input?.idCardNumber),
      nokName, nokRelationship, nokPhone, nokEmail,
      ecName, ecPhone, ecRelationship,
    ],
  );
  return rows[0];
}

export async function listRegistrations(query: ListRegistrationsQuery = {}) {
  const status = query.status ?? 'pending';
  if (!(REGISTRATION_STATUSES as readonly string[]).includes(status)) {
    throw new ApiError(400, 'INVALID_INPUT', `status must be one of: ${REGISTRATION_STATUSES.join(', ')}`);
  }

  const { rows } = await pool.query(
    `${REGISTRATION_SELECT} where status = $1 order by submitted_at asc`,
    [status],
  );
  return rows;
}

/**
 * Approve a pending registration into a real student record. The stored
 * submission is combined with the staff-supplied enrolment details and run
 * through the shared insertStudentRow path (duplicate guard included) in one
 * transaction with the status update — so a failure can't leave a student
 * created but the registration still marked pending (letting it be approved
 * again into a duplicate student).
 */
export async function approveRegistration(
  id: string,
  input: ApproveRegistrationInput,
  actingUser: ActingUser,
) {
  const enrolmentType = requireString(input?.enrolmentType, 'enrolmentType');

  return withUserContext(actingUser.id, async (client) => {
    const { rows } = await client.query(
      `select * from public.student_registrations where id = $1 for update`,
      [id],
    );
    const registration = rows[0];
    if (!registration) {
      throw new ApiError(404, 'NOT_FOUND', 'Registration not found.');
    }
    if (registration.status !== 'pending') {
      throw new ApiError(409, 'ALREADY_REVIEWED', `This registration has already been ${registration.status}.`);
    }

    // students has no next-of-kin columns; collapse the emergency contact into
    // its single text field and carry the ID number into ghana_card_no.
    const emergencyContact = registration.ec_name
      ? `${registration.ec_name}${registration.ec_relationship ? ` (${registration.ec_relationship})` : ''}${registration.ec_phone ? ` — ${registration.ec_phone}` : ''}`
      : undefined;

    const student = await studentService.insertStudentRow(
      client,
      {
        firstName: registration.first_name,
        lastName: registration.last_name,
        gender: registration.gender,
        dob: registration.dob,
        phone: registration.phone,
        email: registration.email ?? undefined,
        address: registration.address ?? undefined,
        emergencyContact,
        ghanaCardNo: registration.id_card_number ?? undefined,
        photoUrl: registration.photo_url ?? undefined,
        enrolmentType,
        packageId: input?.packageId,
        confirmDifferentPerson: input?.confirmDifferentPerson,
      },
      actingUser,
    );

    await client.query(
      `update public.student_registrations
          set status = 'approved', student_id = $1, reviewed_by = $2, reviewed_at = now()
        where id = $3`,
      [student.id, actingUser.id, id],
    );

    return student;
  });
}

/**
 * Reject a pending registration, recording who rejected it and why.
 */
export async function rejectRegistration(id: string, reasonInput: unknown, actingUser: ActingUser) {
  const reason = typeof reasonInput === 'string' ? reasonInput.trim() : '';
  if (!reason) {
    throw new ApiError(400, 'INVALID_INPUT', 'A rejection reason is required.');
  }

  return withUserContext(actingUser.id, async (client) => {
    const { rows } = await client.query(
      `select status from public.student_registrations where id = $1 for update`,
      [id],
    );
    const registration = rows[0];
    if (!registration) {
      throw new ApiError(404, 'NOT_FOUND', 'Registration not found.');
    }
    if (registration.status !== 'pending') {
      throw new ApiError(409, 'ALREADY_REVIEWED', `This registration has already been ${registration.status}.`);
    }

    await client.query(
      `update public.student_registrations
          set status = 'rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = now()
        where id = $3`,
      [reason, actingUser.id, id],
    );

    const { rows: updated } = await client.query(`${REGISTRATION_SELECT} where id = $1`, [id]);
    return updated[0];
  });
}
