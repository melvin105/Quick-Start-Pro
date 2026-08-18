import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as studentService from '../services/studentService';

function actingUser(req: Request) {
  const user = req.user as NonNullable<Request['user']>;
  return { id: user.id, role: user.role as 'manager' | 'secretary' };
}

function paramId(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.createStudent(req.body ?? {}, actingUser(req));
  res.status(201).json(student);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, enrolmentType, page, limit } = req.query;
  const result = await studentService.listStudents({
    search: typeof search === 'string' ? search : undefined,
    status: typeof status === 'string' ? status : undefined,
    enrolmentType: typeof enrolmentType === 'string' ? enrolmentType : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

export const listLicences = asyncHandler(async (_req: Request, res: Response) => {
  const licences = await studentService.listLicences();
  res.json(licences);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(paramId(req));
  res.json(student);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'INVALID_INPUT', 'Request body is required.');
  }
  const student = await studentService.updateStudent(paramId(req), req.body, actingUser(req));
  res.json(student);
});

export const assignPackage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'INVALID_INPUT', 'Request body is required.');
  }
  const student = await studentService.assignPackage(paramId(req), req.body, actingUser(req));
  res.json(student);
});

export const updateLicence = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'INVALID_INPUT', 'Request body is required.');
  }
  const licence = await studentService.upsertLicence(paramId(req), req.body, actingUser(req));
  res.json(licence);
});
