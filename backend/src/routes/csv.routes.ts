import { Router } from 'express';
import { csvUpload } from '../middleware/upload';
import { csvProcessRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';
import { previewCsvHandler, processCsvHandler } from '../controllers/csv.controller';

const router = Router();

router.post(
  '/process',
  csvProcessRateLimiter,
  csvUpload.single('file'),
  asyncHandler(processCsvHandler)
);

router.post('/preview', csvUpload.single('file'), asyncHandler(previewCsvHandler));

export default router;
