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

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
    throw new ApiError(401, 'INVALID_REFRESH', 'Your session has expired. Please sign in again.');
  }

  const result = await authService.refresh(refreshToken);
  res.json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as NonNullable<Request['user']>;
  const { refreshToken } = req.body ?? {};
  await authService.logout(user.jti, user.exp, typeof refreshToken === 'string' ? refreshToken : undefined);
  res.json({ status: 'ok' });
});
