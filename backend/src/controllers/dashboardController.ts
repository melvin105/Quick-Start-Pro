import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as dashboardService from '../services/dashboardService';

export const get = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as NonNullable<Request['user']>;
  const role = user.role as 'manager' | 'secretary';
  const data = await dashboardService.getDashboard(role);
  res.json(data);
});
