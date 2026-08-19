import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as paymentService from '../services/paymentService';

function actingUser(req: Request) {
  const user = req.user as NonNullable<Request['user']>;
  return { id: user.id, role: user.role as 'manager' | 'secretary' };
}

function paramId(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.recordPayment(req.body ?? {}, actingUser(req));
  res.status(201).json(payment);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { studentId, method, status, dateFrom, dateTo, search, page, limit } = req.query;
  const result = await paymentService.listPayments({
    studentId: typeof studentId === 'string' ? studentId : undefined,
    method: typeof method === 'string' ? method : undefined,
    status: typeof status === 'string' ? status : undefined,
    dateFrom: typeof dateFrom === 'string' ? dateFrom : undefined,
    dateTo: typeof dateTo === 'string' ? dateTo : undefined,
    search: typeof search === 'string' ? search : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

export const history = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.getStudentPaymentHistory(paramId(req, 'studentId'));
  res.json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  // Body shape is guaranteed by validateBody(updatePaymentSchema) at the route.
  const payment = await paymentService.updatePayment(paramId(req, 'id'), req.body, actingUser(req));
  res.json(payment);
});
