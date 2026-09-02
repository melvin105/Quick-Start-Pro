import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as reportService from '../services/reportService';

export const revenue = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const rows = await reportService.getRevenueReport({
    from: typeof from === 'string' ? from : undefined,
    to: typeof to === 'string' ? to : undefined,
  });
  res.json(rows);
});

export const dvla = asyncHandler(async (req: Request, res: Response) => {
  const { status, from, to } = req.query;
  const rows = await reportService.getDvlaReport({
    status: typeof status === 'string' ? status : undefined,
    from: typeof from === 'string' ? from : undefined,
    to: typeof to === 'string' ? to : undefined,
  });
  res.json(rows);
});

export const driver = asyncHandler(async (req: Request, res: Response) => {
  const { from, to, instructorId } = req.query;
  const result = await reportService.getDriverReport({
    from: typeof from === 'string' ? from : '',
    to: typeof to === 'string' ? to : '',
    instructorId: typeof instructorId === 'string' && instructorId ? instructorId : undefined,
  });
  res.json(result);
});

export const finances = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const result = await reportService.getFinances({
    from: typeof from === 'string' ? from : '',
    to: typeof to === 'string' ? to : '',
  });
  res.json(result);
});

export const operational = asyncHandler(async (req: Request, res: Response) => {
  const kind = (Array.isArray(req.params.kind) ? req.params.kind[0] : req.params.kind) as reportService.OperationalReportKind;
  if (!['students', 'attendance', 'expenses', 'schedule'].includes(kind)) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Report not found.' } });
    return;
  }
  const { from, to } = req.query;
  const result = await reportService.getOperationalReport(kind, typeof from === 'string' ? from : '', typeof to === 'string' ? to : '');
  res.json(result);
});
