import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as packageService from '../services/packageService';

function paramId(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { activeOnly } = req.query;
  const packages = await packageService.listPackages({ activeOnly: activeOnly === 'true' });
  res.json(packages);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const pkg = await packageService.getPackageById(paramId(req));
  res.json(pkg);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const pkg = await packageService.createPackage(req.body ?? {});
  res.status(201).json(pkg);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'INVALID_INPUT', 'Request body is required.');
  }
  const pkg = await packageService.updatePackage(paramId(req), req.body);
  res.json(pkg);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await packageService.deletePackage(paramId(req));
  res.status(204).send();
});
