import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as attendanceService from '../services/attendanceService';

function actingUserId(req: Request): string {
  const user = req.user as NonNullable<Request['user']>;
  return user.id;
}

export const mark = asyncHandler(async (req: Request, res: Response) => {
  const attendance = await attendanceService.markAttendance(req.body ?? {}, actingUserId(req));
  res.status(201).json(attendance);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { date, status } = req.query;
  const result = await attendanceService.listAttendance({
    date: typeof date === 'string' ? date : undefined,
    status: typeof status === 'string' ? status : undefined,
  });
  res.json(result);
});

export const studentHistory = asyncHandler(async (req: Request, res: Response) => {
  const value = req.params.studentId;
  const studentId = Array.isArray(value) ? value[0] : value;
  const result = await attendanceService.getStudentAttendanceHistory(studentId);
  res.json(result);
});
