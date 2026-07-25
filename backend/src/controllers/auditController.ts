import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as auditService from '../services/auditService';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { tableName, action, userId, dateFrom, dateTo, page, limit } = req.query;
  const result = await auditService.listAuditLogs({
    tableName: typeof tableName === 'string' ? tableName : undefined,
    action: typeof action === 'string' ? action : undefined,
    userId: typeof userId === 'string' ? userId : undefined,
    dateFrom: typeof dateFrom === 'string' ? dateFrom : undefined,
    dateTo: typeof dateTo === 'string' ? dateTo : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});
