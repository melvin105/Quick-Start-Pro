import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as notificationService from '../services/notificationService';

// The signed-in user is both a person (recipient_user) and a role
// (recipient_role); notifications addressed to either reach them.
function recipient(req: Request) {
  const user = req.user as NonNullable<Request['user']>;
  return { userId: user.id, role: user.role as 'manager' | 'secretary' };
}

function paramId(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.listForRecipient(recipient(req));
  res.json(result);
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markRead(paramId(req), recipient(req));
  res.status(204).send();
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const updated = await notificationService.markAllRead(recipient(req));
  res.json({ updated });
});
