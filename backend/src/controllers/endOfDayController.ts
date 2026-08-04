import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as endOfDayService from '../services/endOfDayService';

function actingUser(req: Request) {
  const user = req.user as NonNullable<Request['user']>;
  return { id: user.id, role: user.role as 'manager' | 'secretary' };
}

export const submit = asyncHandler(async (req: Request, res: Response) => {
  const closure = await endOfDayService.submitEndOfDay(req.body?.date, actingUser(req));
  res.status(201).json(closure);
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  const closure = await endOfDayService.approveEndOfDay(req.body?.date, actingUser(req));
  res.json(closure);
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const closure = await endOfDayService.rejectEndOfDay(req.body?.date, req.body?.note, actingUser(req));
  res.json(closure);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const closures = await endOfDayService.listClosures({
    status: typeof status === 'string' ? status : undefined,
  });
  res.json(closures);
});
