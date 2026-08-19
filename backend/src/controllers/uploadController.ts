import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as uploadService from '../services/uploadService';

function paramKind(req: Request): string {
  const { kind } = req.params;
  return Array.isArray(kind) ? kind[0] : kind;
}

// multer puts the parsed file on req.file. It isn't in the base Express types
// here (no @types augmentation wired up), so read it off a narrowed shape.
function reqFile(req: Request): uploadService.UploadedFile | undefined {
  const file = (req as Request & { file?: uploadService.UploadedFile }).file;
  return file;
}

export const upload = asyncHandler(async (req: Request, res: Response) => {
  const result = await uploadService.uploadForKind(paramKind(req), reqFile(req));
  res.status(201).json(result);
});
