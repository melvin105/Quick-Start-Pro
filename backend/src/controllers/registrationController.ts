import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as registrationService from '../services/registrationService';
import { createRegistrationToken } from '../services/publicTokenService';

function actingUser(req: Request) {
  const user = req.user as NonNullable<Request['user']>;
  return { id: user.id, role: user.role as 'manager' | 'secretary' };
}

function paramId(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

// Public — no req.user (see routes/registrations.ts).
export const submit = asyncHandler(async (req: Request, res: Response) => {
  const registration = await registrationService.submitRegistration(req.body ?? {});
  res.status(201).json(registration);
});

export const createInvitation = asyncHandler(async (req: Request, res: Response) => {
  const phone = typeof req.body?.phone === 'string' ? req.body.phone : undefined;
  res.status(201).json(createRegistrationToken(phone));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const registrations = await registrationService.listRegistrations({ status });
  res.json(registrations);
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'INVALID_INPUT', 'Request body is required.');
  }
  const student = await registrationService.approveRegistration(paramId(req), req.body, actingUser(req));
  res.status(201).json(student);
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const registration = await registrationService.rejectRegistration(
    paramId(req),
    (req.body ?? {}).reason,
    actingUser(req),
  );
  res.json(registration);
});
