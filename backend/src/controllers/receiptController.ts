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
  // This response carries a student's financial PII behind a shareable, login-
  // free URL. Keep it out of shared caches, and out of search-engine indexes in
  // case a link ever leaks into a referrer, crawl, or pasted-somewhere-public.
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, noarchive');
  const receipt = await paymentService.getReceiptById(id);
  res.json(receipt);
});
