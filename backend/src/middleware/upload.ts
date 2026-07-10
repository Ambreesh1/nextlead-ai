import multer from 'multer';
import { Request } from 'express';
import { env } from '../config/env';
import { BadRequestError } from '../utils/AppError';

const ALLOWED_MIME_TYPES = new Set([
  'text/csv',
  'application/vnd.ms-excel',
  'application/csv',
  'text/x-csv',
  'text/plain', // some browsers/OSes report CSV as plain text
]);

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void {
  const isCsvExtension = file.originalname.toLowerCase().endsWith('.csv');
  const isCsvMime = ALLOWED_MIME_TYPES.has(file.mimetype);

  if (!isCsvExtension && !isCsvMime) {
    callback(new BadRequestError('Only .csv files are supported', 'INVALID_FILE_TYPE'));
    return;
  }

  callback(null, true);
}

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter,
});
