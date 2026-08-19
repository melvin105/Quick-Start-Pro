// pg returns Postgres `numeric` columns as strings (they can exceed float
// precision), not JS numbers. Left unconverted, money/balance fields reach
// the API as e.g. "150.00" instead of 150, which breaks frontend arithmetic,
// formatting, and chart libraries that expect a real number.
//
// Use this on any row (or array of rows) returned to an API response that
// includes numeric(...) columns — pass the field names to convert.
export function normalizeNumericFields<T extends Record<string, unknown>>(
  row: T,
  fields: readonly string[],
): T {
  const result: Record<string, unknown> = { ...row };
  for (const field of fields) {
    if (result[field] !== null && result[field] !== undefined) {
      result[field] = Number(result[field]);
    }
  }
  return result as T;
}

export function normalizeNumericRows<T extends Record<string, unknown>>(
  rows: T[],
  fields: readonly string[],
): T[] {
  return rows.map((row) => normalizeNumericFields(row, fields));
}
