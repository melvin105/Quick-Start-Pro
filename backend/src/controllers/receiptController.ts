import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as paymentService from '../services/paymentService';
import { ApiError } from '../utils/ApiError';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function paramId(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = paramId(req);
  if (!UUID_RE.test(id)) throw new ApiError(400, 'INVALID_INPUT', 'Receipt id must be a valid UUID.');
  res.setHeader('Cache-Control', 'private, no-store');
  const receipt = await paymentService.getReceiptById(id);
  res.json(receipt);
});
