import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as instructorService from '../services/instructorService';

function actingUserId(req: Request): string {
  const user = req.user as NonNullable<Request['user']>;
  return user.id;
}

function paramId(req: Request): string {
  const value = req.params.id;
  return Array.isArray(value) ? value[0] : value;
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const instructor = await instructorService.createInstructor(req.body ?? {}, actingUserId(req));
  res.status(201).json(instructor);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { status, search } = req.query;
  const result = await instructorService.listInstructors({
    status: typeof status === 'string' ? status : undefined,
    search: typeof search === 'string' ? search : undefined,
  });
  res.json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const instructor = await instructorService.getInstructorById(paramId(req));
  res.json(instructor);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'INVALID_INPUT', 'Request body is required.');
  }
  const instructor = await instructorService.updateInstructor(paramId(req), req.body, actingUserId(req));
  res.json(instructor);
});

export const lessons = asyncHandler(async (req: Request, res: Response) => {
  const { date, dateFrom, dateTo, status } = req.query;
  const result = await instructorService.getInstructorLessons(paramId(req), {
    date: typeof date === 'string' ? date : undefined,
    dateFrom: typeof dateFrom === 'string' ? dateFrom : undefined,
    dateTo: typeof dateTo === 'string' ? dateTo : undefined,
    status: typeof status === 'string' ? status : undefined,
  });
  res.json(result);
});
