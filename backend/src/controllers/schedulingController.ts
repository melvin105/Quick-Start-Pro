import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as schedulingService from '../services/schedulingService';

function actingUserId(req: Request): string {
  const user = req.user as NonNullable<Request['user']>;
  return user.id;
}

function param(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const result = await schedulingService.listSlots();
  res.json(result);
});

export const assign = asyncHandler(async (req: Request, res: Response) => {
  const slot = await schedulingService.assignStudent(param(req, 'slotId'), req.body ?? {}, actingUserId(req));
  res.status(201).json(slot);
});

export const unassign = asyncHandler(async (req: Request, res: Response) => {
  const slot = await schedulingService.unassignStudent(
    param(req, 'slotId'),
    param(req, 'studentId'),
    actingUserId(req),
  );
  res.json(slot);
});
