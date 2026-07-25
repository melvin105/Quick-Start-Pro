import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as lessonService from '../services/lessonService';

function actingUser(req: Request) {
  const user = req.user as NonNullable<Request['user']>;
  return { id: user.id, role: user.role as 'manager' | 'secretary' };
}

function paramId(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await lessonService.scheduleLesson(req.body ?? {}, actingUser(req));
  res.status(201).json(lesson);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { date, dateFrom, dateTo, instructorId, studentId, status, page, limit } = req.query;
  const result = await lessonService.listLessons({
    date: typeof date === 'string' ? date : undefined,
    dateFrom: typeof dateFrom === 'string' ? dateFrom : undefined,
    dateTo: typeof dateTo === 'string' ? dateTo : undefined,
    instructorId: typeof instructorId === 'string' ? instructorId : undefined,
    studentId: typeof studentId === 'string' ? studentId : undefined,
    status: typeof status === 'string' ? status : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'INVALID_INPUT', 'Request body is required.');
  }
  const lesson = await lessonService.updateLesson(paramId(req, 'id'), req.body, actingUser(req));
  res.json(lesson);
});
