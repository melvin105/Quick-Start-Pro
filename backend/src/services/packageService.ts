import { pool } from '../db';
import { ApiError } from '../utils/ApiError';
import { normalizeNumericFields, normalizeNumericRows } from '../utils/normalizeNumeric';

const PACKAGE_FIELDS = ['total_fee'] as const;

export interface CreatePackageInput {
  packageName: string;
  durationWeeks?: number | null;
  lessonCount: number;
  totalFee: number;
  isActive?: boolean;
}

export interface UpdatePackageInput {
  packageName?: string;
  durationWeeks?: number | null;
  lessonCount?: number;
  totalFee?: number;
  isActive?: boolean;
}

export interface ListPackagesQuery {
  activeOnly?: boolean;
}

async function assertNameAvailable(packageName: string, excludeId?: string): Promise<void> {
  const params: unknown[] = [packageName];
  let query = `select id from public.driving_packages where lower(package_name) = lower($1)`;
  if (excludeId) {
    params.push(excludeId);
    query += ` and id <> $2`;
  }
  const { rows } = await pool.query(query, params);
  if (rows[0]) {
    throw new ApiError(409, 'CONFLICT', `A package named "${packageName}" already exists.`);
  }
}

export async function listPackages(query: ListPackagesQuery) {
  const where = query.activeOnly ? `where is_active = true` : '';
  const { rows } = await pool.query(
    `select * from public.driving_packages ${where} order by package_name`,
  );
  return normalizeNumericRows(rows, PACKAGE_FIELDS);
}

export async function getPackageById(id: string) {
  const { rows } = await pool.query(`select * from public.driving_packages where id = $1`, [id]);
  if (!rows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Package not found.');
  }
  return normalizeNumericFields(rows[0], PACKAGE_FIELDS);
}

export async function createPackage(input: CreatePackageInput) {
  const { packageName, durationWeeks, lessonCount, totalFee, isActive } = input;

  if (!packageName || lessonCount == null || totalFee == null) {
    throw new ApiError(400, 'INVALID_INPUT', 'packageName, lessonCount and totalFee are required.');
  }
  if (lessonCount <= 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'lessonCount must be greater than 0.');
  }
  if (totalFee < 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'totalFee cannot be negative.');
  }
  if (durationWeeks != null && durationWeeks <= 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'durationWeeks must be greater than 0.');
  }

  await assertNameAvailable(packageName);

  const { rows } = await pool.query(
    `insert into public.driving_packages (package_name, duration_weeks, lesson_count, total_fee, is_active)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [packageName, durationWeeks ?? null, lessonCount, totalFee, isActive ?? true],
  );
  return normalizeNumericFields(rows[0], PACKAGE_FIELDS);
}

export async function updatePackage(id: string, input: UpdatePackageInput) {
  if (input.lessonCount != null && input.lessonCount <= 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'lessonCount must be greater than 0.');
  }
  if (input.totalFee != null && input.totalFee < 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'totalFee cannot be negative.');
  }
  if (input.durationWeeks != null && input.durationWeeks <= 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'durationWeeks must be greater than 0.');
  }
  if (input.packageName) {
    await assertNameAvailable(input.packageName, id);
  }

  const fieldMap: Record<string, unknown> = {
    package_name: input.packageName,
    duration_weeks: input.durationWeeks,
    lesson_count: input.lessonCount,
    total_fee: input.totalFee,
    is_active: input.isActive,
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

  setClauses.push(`updated_at = now()`);
  params.push(id);
  const { rows } = await pool.query(
    `update public.driving_packages set ${setClauses.join(', ')} where id = $${params.length} returning *`,
    params,
  );
  if (!rows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Package not found.');
  }
  return normalizeNumericFields(rows[0], PACKAGE_FIELDS);
}

export async function deletePackage(id: string) {
  const { rows: usageRows } = await pool.query(
    `select 1 from public.student_packages where package_id = $1 limit 1`,
    [id],
  );
  if (usageRows[0]) {
    throw new ApiError(
      409,
      'CONFLICT',
      'This package has enrolled students and cannot be deleted. Deactivate it instead.',
    );
  }

  const { rows } = await pool.query(
    `delete from public.driving_packages where id = $1 returning id`,
    [id],
  );
  if (!rows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Package not found.');
  }
}
