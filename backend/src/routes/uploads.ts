import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import * as uploadController from '../controllers/uploadController';
import { authenticate, requireRole } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';
import { MAX_UPLOAD_BYTES } from '../services/uploadService';

const router = Router();

// Buffer the upload in memory (small files, capped below) so the service can
// validate the bytes and stream them straight to Supabase Storage without ever
// touching local disk. The hard byte limit is the largest per-kind cap; the
// exact per-kind size is then enforced in uploadService.
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});

// Wrap multer so its own errors (e.g. LIMIT_FILE_SIZE, unexpected field) come
// back as our standard 400 ApiError shape instead of multer's raw error.
function singleFile(field: string) {
  const handler = memoryUpload.single(field);
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, (err: unknown) => {
      if (err instanceof MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'File is too large.'
            : `Upload error: ${err.message}.`;
        return next(new ApiError(400, 'INVALID_UPLOAD', message));
      }
      if (err) return next(err);
      next();
    });
  };
}

router.use(authenticate);

// Staff upload student photos and identity documents from the register/edit
// flows. Both roles register students, so both may upload. The `:kind` selects
// the target bucket + validation rules (see uploadService.UPLOAD_KINDS).
router.post('/:kind', requireRole('manager', 'secretary'), singleFile('file'), uploadController.upload);

export default router;
