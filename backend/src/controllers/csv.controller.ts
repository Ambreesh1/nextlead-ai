import { Request, Response } from 'express';
import { parseCsvBuffer } from '../services/csvParser.service';
import { processCsvRows } from '../services/extraction.service';
import { BadRequestError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * POST /api/csv/process
 * Accepts a multipart/form-data upload with field name "file", parses it,
 * runs AI-based CRM field extraction in batches, and returns the
 * structured result. This is the ONLY endpoint that triggers AI calls -
 * the frontend must have already shown the user a preview and obtained
 * explicit confirmation before calling this.
 */
export async function processCsvHandler(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new BadRequestError('No file uploaded. Attach a CSV file as "file".', 'NO_FILE');
  }

  logger.info('Received CSV for processing', {
    originalName: req.file.originalname,
    sizeBytes: req.file.size,
  });

  const { headers, rows } = parseCsvBuffer(req.file.buffer);

  if (rows.length === 0) {
    throw new BadRequestError(
      'The CSV file has headers but no data rows to process.',
      'NO_DATA_ROWS'
    );
  }

  const result = await processCsvRows(headers, rows);

  res.status(200).json({
    success: true,
    data: result,
  });
}

/**
 * POST /api/csv/preview
 * Optional server-side preview endpoint (parse only, no AI). The primary
 * preview flow happens client-side for instant feedback, but this is
 * exposed too so the preview logic can be verified/re-used server-side
 * (e.g. for very large files where client-side parsing is undesirable).
 */
export async function previewCsvHandler(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new BadRequestError('No file uploaded. Attach a CSV file as "file".', 'NO_FILE');
  }

  const { headers, rows } = parseCsvBuffer(req.file.buffer);

  res.status(200).json({
    success: true,
    data: {
      headers,
      rows: rows.slice(0, 50),
      totalRows: rows.length,
    },
  });
}
