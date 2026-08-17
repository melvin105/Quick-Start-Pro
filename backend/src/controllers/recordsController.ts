import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as recordsService from '../services/recordsService';

export const daily = asyncHandler(async (req: Request, res: Response) => {
  const date = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().slice(0, 10);
  res.json(await recordsService.getDailyRecords(date));
});
