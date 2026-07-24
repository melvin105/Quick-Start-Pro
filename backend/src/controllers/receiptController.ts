import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as paymentService from '../services/paymentService';

function paramId(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const receipt = await paymentService.getReceiptById(paramId(req));
  res.json(receipt);
});
