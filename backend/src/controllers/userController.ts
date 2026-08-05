import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as userService from '../services/userService';

function actingUser(req: Request) {
  const user = req.user as NonNullable<Request['user']>;
  return { id: user.id, role: user.role as 'manager' | 'secretary' };
}

function paramId(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body ?? {}, actingUser(req));
  res.status(201).json(user);
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.listUsers();
  res.json(users);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'INVALID_INPUT', 'Request body is required.');
  }
  const user = await userService.updateUser(paramId(req, 'id'), req.body, actingUser(req));
  res.json(user);
});
