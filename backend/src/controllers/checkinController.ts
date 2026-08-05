import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as checkinService from '../services/checkinService';

// All handlers are public (no req.user) — see routes/checkin.ts.

export const lookup = asyncHandler(async (req: Request, res: Response) => {
  const result = await checkinService.lookupByPhone(req.body ?? {});
  res.json(result);
});

export const checkIn = asyncHandler(async (req: Request, res: Response) => {
  const result = await checkinService.selfCheckIn(req.body ?? {});
  res.status(201).json(result);
});

export const instructors = asyncHandler(async (_req: Request, res: Response) => {
  const result = await checkinService.listActiveInstructors();
  res.json(result);
});
