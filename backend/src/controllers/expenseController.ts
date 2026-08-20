import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as expenseService from '../services/expenseService';

function actingUser(req: Request) {
  const user = req.user as NonNullable<Request['user']>;
  return { id: user.id, role: user.role as 'manager' | 'secretary' };
}

function paramId(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.createExpense(req.body ?? {}, actingUser(req));
  res.status(201).json(expense);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { dateFrom, dateTo, category, vehicleId, page, limit } = req.query;
  const result = await expenseService.listExpenses({
    dateFrom: typeof dateFrom === 'string' ? dateFrom : undefined,
    dateTo: typeof dateTo === 'string' ? dateTo : undefined,
    category: typeof category === 'string' ? category : undefined,
    vehicleId: typeof vehicleId === 'string' ? vehicleId : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  // Body shape is guaranteed by validateBody(updateExpenseSchema) at the route.
  const expense = await expenseService.updateExpense(paramId(req, 'id'), req.body, actingUser(req));
  res.json(expense);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await expenseService.deleteExpense(paramId(req, 'id'), actingUser(req));
  res.status(204).send();
});
