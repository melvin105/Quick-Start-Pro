import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as authService from '../services/authService';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { role, password } = req.body ?? {};
  if (typeof role !== 'string' || typeof password !== 'string') {
    throw new ApiError(400, 'INVALID_INPUT', 'role and password are required.');
  }

  const result = await authService.login(role, password);
  res.json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as NonNullable<Request['user']>;
  await authService.logout(user.jti, user.exp);
  res.json({ status: 'ok' });
});
