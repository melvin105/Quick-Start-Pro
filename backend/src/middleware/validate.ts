import { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError';

interface ZodIssueLike {
  path: PropertyKey[];
  message: string;
}

// Turn a set of Zod issues into one readable, field-by-field message, e.g.
// "amount: must be greater than 0; method: must be one of: cash, momo, ...".
// A root-level issue (empty path) is reported against "body".
function formatIssues(issues: ZodIssueLike[]): string {
  return issues
    .map((issue) => {
      const field = issue.path.length ? issue.path.join('.') : 'body';
      return `${field}: ${issue.message}`;
    })
    .join('; ');
}

// Validates and normalises req.body against a schema BEFORE the controller runs.
// This is the single, centralised request-boundary guard: on success the parsed
// value (coerced and typed) replaces req.body so downstream code receives clean
// data; on failure every malformed request fails the same way — a 400
// VALIDATION_ERROR with a readable message — instead of the ad-hoc, inconsistent
// checks that used to live in individual controllers and services.
//
// Services keep their own domain checks (duplicate detection, day locks, DB
// constraints) as defence in depth — this guard only owns request shape: types,
// enums, required fields, and id formats.
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return next(new ApiError(400, 'VALIDATION_ERROR', formatIssues(result.error.issues)));
    }
    // Hand the controller the parsed/coerced value (unknown keys stripped by the
    // schema unless it opts into passthrough).
    req.body = result.data;
    next();
  };
}
