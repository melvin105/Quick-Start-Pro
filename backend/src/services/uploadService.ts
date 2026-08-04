import { randomUUID } from 'crypto';
import { ApiError } from '../utils/ApiError';
import * as storageService from './storageService';

// One place to describe every upload target. Adding a new document type
// (e.g. a receipt scan) is a single entry here — the route/controller/service
// are all generic over `kind`. Each kind maps to a private bucket, the mime
// types it accepts (with the file extension to store under), and a size cap.
interface UploadKind {
  bucket: string;
  maxBytes: number;
  mimes: Record<string, string>; // mime type -> file extension
}

const IMAGE_MIMES = { 'image/jpeg': 'jpg', 'image/png': 'png' };
const DOC_MIMES = { ...IMAGE_MIMES, 'application/pdf': 'pdf' };

export const UPLOAD_KINDS: Record<string, UploadKind> = {
  'student-photo': { bucket: 'student-photos', maxBytes: 2 * 1024 * 1024, mimes: IMAGE_MIMES },
  'ghana-card': { bucket: 'ghana-cards', maxBytes: 5 * 1024 * 1024, mimes: DOC_MIMES },
  'licence-document': { bucket: 'licence-documents', maxBytes: 5 * 1024 * 1024, mimes: DOC_MIMES },
};

// The largest cap across all kinds — used as multer's hard limit so absurdly
// large uploads are rejected before buffering, with the exact per-kind cap
// enforced below.
export const MAX_UPLOAD_BYTES = Math.max(...Object.values(UPLOAD_KINDS).map((k) => k.maxBytes));

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface UploadResult {
  bucket: string;
  path: string;
  reference: string; // `${bucket}/${path}` — what callers store in photo_url etc.
  signedUrl: string; // short-lived URL for immediate preview
}

/**
 * Validate an uploaded file against its kind and push it to Storage.
 * Returns the stable storage reference plus a short-lived signed URL.
 */
export async function uploadForKind(kind: string, file: UploadedFile | undefined): Promise<UploadResult> {
  const config = UPLOAD_KINDS[kind];
  if (!config) {
    const kinds = Object.keys(UPLOAD_KINDS).join(', ');
    throw new ApiError(400, 'INVALID_INPUT', `Unknown upload kind '${kind}'. Expected one of: ${kinds}.`);
  }

  if (!file) {
    throw new ApiError(400, 'INVALID_INPUT', 'No file was provided (expected multipart field "file").');
  }

  const ext = config.mimes[file.mimetype];
  if (!ext) {
    const allowed = Object.keys(config.mimes).join(', ');
    throw new ApiError(400, 'INVALID_FILE_TYPE', `Unsupported file type '${file.mimetype}'. Allowed: ${allowed}.`);
  }

  if (file.size > config.maxBytes) {
    const mb = (config.maxBytes / (1024 * 1024)).toFixed(0);
    throw new ApiError(400, 'FILE_TOO_LARGE', `File exceeds the ${mb}MB limit for ${kind}.`);
  }

  const objectPath = `${randomUUID()}.${ext}`;
  const { bucket, path } = await storageService.uploadObject(config.bucket, objectPath, file.buffer, file.mimetype);
  const signedUrl = await storageService.createSignedUrl(bucket, path);

  return { bucket, path, reference: `${bucket}/${path}`, signedUrl };
}
