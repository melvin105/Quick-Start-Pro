import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';

// day_of_week is 1=Mon … 6=Sat (ISO-ish, Sunday excluded), matching the
// schedule_slots.day_of_week check constraint and the frontend Day enum.
const DAY_ABBR: Record<number, string> = {
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
};

export interface AssignStudentInput {
  studentId: string;
}

export interface ApplySlotToDaysInput {
  studentId: string;
  days: number[];
}

export interface ApplySlotToDaysResult {
  assignedDays: number[];
  alreadyAssignedDays: number[];
  startHour: number;
}

// A slot row plus the students currently assigned to it. `startHour` and
// `day` are derived conveniences so the frontend grid (keyed `${DAY}-${hour}`)
// can be rebuilt without parsing the time string itself.
const SELECT_SLOT = `
  select
    sl.id, sl.day_of_week, sl.start_time, sl.end_time, sl.capacity, sl.is_active
  from public.schedule_slots sl
`;

interface SlotRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  capacity: number;
  is_active: boolean;
}

interface AssignmentRow {
  slot_id: string;
  student_id: string;
  student_number: string;
  student_name: string;
  lessons_left: number | null;
  assigned_date: string;
}

function startHourOf(startTime: string): number {
  // start_time comes back as "HH:MM:SS"
  return Number(startTime.slice(0, 2));
}

function shapeAssignment(row: AssignmentRow) {
  return {
    studentId: row.student_id,
    studentNumber: row.student_number,
    studentName: row.student_name,
    lessonsRemaining: row.lessons_left ?? 0,
    assignedDate: row.assigned_date,
  };
}

function shapeSlot(slot: SlotRow, assignments: AssignmentRow[]) {
  return {
    id: slot.id,
    dayOfWeek: slot.day_of_week,
    day: DAY_ABBR[slot.day_of_week] ?? null,
    startHour: startHourOf(slot.start_time),
    startTime: slot.start_time,
    endTime: slot.end_time,
    capacity: slot.capacity,
    isActive: slot.is_active,
    assignments: assignments.filter((a) => a.slot_id === slot.id).map(shapeAssignment),
  };
}

// Every active assignment across the grid, with the student's remaining
// lessons so the UI can render the amber/grey "nearing end" states.
async function fetchActiveAssignments(): Promise<AssignmentRow[]> {
  const { rows } = await pool.query(
    `select
       sa.slot_id, sa.student_id, sa.assigned_date,
       st.student_number, st.first_name || ' ' || st.last_name as student_name,
       lr.lessons_left
     from public.slot_assignments sa
     join public.students st on st.id = sa.student_id
     left join public.v_lessons_remaining lr on lr.student_id = sa.student_id
     where sa.is_active
     order by st.first_name, st.last_name`,
  );
  return rows as AssignmentRow[];
}

export async function listSlots() {
  const [{ rows: slotRows }, assignments] = await Promise.all([
    pool.query<SlotRow>(`${SELECT_SLOT} order by sl.day_of_week, sl.start_time`),
    fetchActiveAssignments(),
  ]);
  return { slots: slotRows.map((slot) => shapeSlot(slot, assignments)) };
}

async function fetchSlotWithAssignments(slotId: string) {
  const { rows: slotRows } = await pool.query<SlotRow>(`${SELECT_SLOT} where sl.id = $1`, [slotId]);
  if (!slotRows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Schedule slot not found.');
  }
  const assignments = await fetchActiveAssignments();
  return shapeSlot(slotRows[0], assignments);
}

export async function assignStudent(slotId: string, input: AssignStudentInput, actingUserId: string) {
  const { studentId } = input;
  if (!studentId) {
    throw new ApiError(400, 'INVALID_INPUT', 'studentId is required.');
  }

  const { rows: studentRows } = await pool.query(`select id from public.students where id = $1`, [studentId]);
  if (!studentRows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Student not found.');
  }

  return withUserContext(actingUserId, async (client) => {
    // Serialize concurrent assignments to the same slot so the capacity check
    // below can't be bypassed by two requests racing before either commits.
    // A plain row lock won't do — the assignment row we'd insert doesn't exist
    // yet, so there's nothing to lock. Keyed on the slot id.
    await client.query(`select pg_advisory_xact_lock(hashtextextended($1, 0))`, [`slot:${slotId}`]);

    const { rows: slotRows } = await client.query(
      `select id, capacity, is_active from public.schedule_slots where id = $1`,
      [slotId],
    );
    if (!slotRows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'Schedule slot not found.');
    }
    if (!slotRows[0].is_active) {
      throw new ApiError(409, 'SLOT_INACTIVE', 'This slot is not active and cannot take assignments.');
    }

    // Is the student already actively assigned to this slot?
    const { rows: existing } = await client.query(
      `select id, is_active from public.slot_assignments where slot_id = $1 and student_id = $2`,
      [slotId, studentId],
    );
    if (existing[0]?.is_active) {
      throw new ApiError(409, 'ALREADY_ASSIGNED', 'Student is already assigned to this slot.');
    }

    const { rows: countRows } = await client.query(
      `select count(*)::int as active_count
       from public.slot_assignments where slot_id = $1 and is_active`,
      [slotId],
    );
    if (countRows[0].active_count >= slotRows[0].capacity) {
      throw new ApiError(409, 'SLOT_FULL', 'This slot has reached its capacity.');
    }

    if (existing[0]) {
      // Reactivate a previously removed assignment (unique(slot_id, student_id)
      // means we can't just insert a second row).
      await client.query(
        `update public.slot_assignments
         set is_active = true, assigned_date = current_date
         where id = $1`,
        [existing[0].id],
      );
    } else {
      await client.query(
        `insert into public.slot_assignments (slot_id, student_id) values ($1, $2)`,
        [slotId, studentId],
      );
    }

    return fetchSlotWithAssignments(slotId);
  });
}

// Copy one of a student's recurring time slots to the same hour on other days.
// The complete operation runs in one transaction: every requested destination
// is checked before any assignment is written, so a full/inactive slot cannot
// leave the student with a partially copied schedule.
export async function applySlotToDays(
  sourceSlotId: string,
  input: ApplySlotToDaysInput,
  actingUserId: string,
): Promise<ApplySlotToDaysResult> {
  const { studentId } = input;
  if (!studentId) {
    throw new ApiError(400, 'INVALID_INPUT', 'studentId is required.');
  }
  if (!Array.isArray(input.days) || input.days.length === 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'Select at least one destination day.');
  }

  const days = [...new Set(input.days)];
  if (days.some((day) => !Number.isInteger(day) || day < 1 || day > 6)) {
    throw new ApiError(400, 'INVALID_INPUT', 'days must contain Monday–Saturday values only.');
  }

  return withUserContext(actingUserId, async (client) => {
    const { rows: sourceRows } = await client.query<SlotRow>(
      `${SELECT_SLOT} where sl.id = $1`,
      [sourceSlotId],
    );
    const source = sourceRows[0];
    if (!source) {
      throw new ApiError(404, 'NOT_FOUND', 'Source schedule slot not found.');
    }

    const { rows: sourceAssignments } = await client.query(
      `select id from public.slot_assignments
       where slot_id = $1 and student_id = $2 and is_active`,
      [sourceSlotId, studentId],
    );
    if (!sourceAssignments[0]) {
      throw new ApiError(409, 'SOURCE_NOT_ASSIGNED', 'Assign the source slot before applying it to other days.');
    }

    const destinationDays = days.filter((day) => day !== source.day_of_week);
    if (destinationDays.length === 0) {
      throw new ApiError(400, 'INVALID_INPUT', 'Select at least one other day.');
    }

    const { rows: destinationRows } = await client.query<SlotRow>(
      `${SELECT_SLOT}
       where sl.start_time = $1 and sl.day_of_week = any($2::int[])
       order by sl.id`,
      [source.start_time, destinationDays],
    );
    if (destinationRows.length !== destinationDays.length) {
      throw new ApiError(404, 'NOT_FOUND', 'A matching time slot was not found for every selected day.');
    }

    // Always acquire locks in id order to avoid deadlocks when two batch
    // requests overlap. Single-slot assignments use the same lock namespace.
    for (const slot of destinationRows) {
      await client.query(`select pg_advisory_xact_lock(hashtextextended($1, 0))`, [`slot:${slot.id}`]);
    }

    const assignedDays: number[] = [];
    const alreadyAssignedDays: number[] = [];

    // Validate every destination before writing any of them.
    const destinations: Array<{
      slot: SlotRow;
      existing: { id: string; is_active: boolean } | undefined;
    }> = [];
    for (const slot of destinationRows) {
      if (!slot.is_active) {
        throw new ApiError(409, 'SLOT_INACTIVE', `${DAY_ABBR[slot.day_of_week]} at this time is inactive.`);
      }

      const { rows: existingRows } = await client.query(
        `select id, is_active from public.slot_assignments where slot_id = $1 and student_id = $2`,
        [slot.id, studentId],
      );
      const existing = existingRows[0] as { id: string; is_active: boolean } | undefined;
      if (existing?.is_active) {
        alreadyAssignedDays.push(slot.day_of_week);
        continue;
      }

      const { rows: countRows } = await client.query(
        `select count(*)::int as active_count
         from public.slot_assignments where slot_id = $1 and is_active`,
        [slot.id],
      );
      if (countRows[0].active_count >= slot.capacity) {
        throw new ApiError(409, 'SLOT_FULL', `${DAY_ABBR[slot.day_of_week]} at this time is already full.`);
      }
      destinations.push({ slot, existing });
    }

    for (const { slot, existing } of destinations) {
      if (existing) {
        await client.query(
          `update public.slot_assignments
           set is_active = true, assigned_date = current_date
           where id = $1`,
          [existing.id],
        );
      } else {
        await client.query(
          `insert into public.slot_assignments (slot_id, student_id) values ($1, $2)`,
          [slot.id, studentId],
        );
      }
      assignedDays.push(slot.day_of_week);
    }

    return {
      assignedDays: assignedDays.sort((a, b) => a - b),
      alreadyAssignedDays: alreadyAssignedDays.sort((a, b) => a - b),
      startHour: startHourOf(source.start_time),
    };
  });
}

export async function unassignStudent(slotId: string, studentId: string, actingUserId: string) {
  return withUserContext(actingUserId, async (client) => {
    const { rows } = await client.query(
      `update public.slot_assignments
       set is_active = false
       where slot_id = $1 and student_id = $2 and is_active
       returning id`,
      [slotId, studentId],
    );
    if (!rows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'No active assignment found for this student in this slot.');
    }
    return fetchSlotWithAssignments(slotId);
  });
}
