import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as leadService from '../services/leadService';

function actingUser(req: Request) {
  const user = req.user as NonNullable<Request['user']>;
  return { id: user.id, role: user.role as 'manager' | 'secretary' };
}

function paramId(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

export const submit = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.submitLead(req.body ?? {});
  res.status(201).json(lead);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { completed } = req.query;
  const leads = await leadService.listLeads({
    completed: completed === 'true' ? true : completed === 'false' ? false : undefined,
  });
  res.json(leads);
});

export const complete = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'INVALID_INPUT', 'Request body is required.');
  }
  const student = await leadService.completeLead(paramId(req), req.body, actingUser(req));
  res.status(201).json(student);
});
