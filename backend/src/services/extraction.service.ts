import { v4 as uuidv4 } from 'uuid';
import { chunkRows } from './csvParser.service';
import { extractCrmBatch } from './gemini.service';
import { runWithConcurrency } from '../utils/concurrencyPool';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import {
  CrmRecord,
  ExtractedRecord,
  ProcessCsvResult,
  RawCsvRow,
  SkippedRecord,
} from '../types/crm.types';

interface RowWithNumber {
  rowNumber: number;
  raw: RawCsvRow;
}

/**
 * Applies the assignment's mandatory business rule: a record with neither
 * an email nor a mobile number is not a usable CRM lead and must be
 * skipped. This is enforced deterministically in code (not left to the AI)
 * so behavior is guaranteed and testable regardless of model output.
 */
function hasContactInfo(record: CrmRecord): boolean {
  const hasEmail = Boolean(record.email && record.email.trim());
  const hasMobile = Boolean(
    record.mobile_without_country_code && record.mobile_without_country_code.trim()
  );
  return hasEmail || hasMobile;
}

/**
 * Processes an entire parsed CSV: batches rows, sends each batch to Gemini
 * (with bounded concurrency), applies the skip rule, and assembles the
 * final result including counts and per-row skip reasons.
 */
export async function processCsvRows(
  headers: string[],
  rows: RawCsvRow[]
): Promise<ProcessCsvResult> {
  const startTime = Date.now();
  const jobId = uuidv4();

  const numberedRows: RowWithNumber[] = rows.map((raw, idx) => ({
    rowNumber: idx + 1,
    raw,
  }));

  const batches = chunkRows(numberedRows, env.CSV_BATCH_SIZE);

  logger.info(`Starting CSV extraction job ${jobId}`, {
    totalRows: rows.length,
    batchCount: batches.length,
    batchSize: env.CSV_BATCH_SIZE,
  });

  const records: ExtractedRecord[] = [];
  const skipped: SkippedRecord[] = [];
  let batchesFailed = 0;

  const tasks = batches.map((batch) => async () => {
    const crmRecords = await extractCrmBatch(
      headers,
      batch.map((r) => r.raw)
    );
    return { batch, crmRecords };
  });

  const settled = await runWithConcurrency(tasks, env.GEMINI_CONCURRENCY);

  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i];
    const batch = batches[i];

    if (outcome.status === 'rejected') {
      batchesFailed += 1;
      logger.error(`Batch ${i + 1}/${batches.length} failed entirely`, {
        error: outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
      });

      for (const row of batch) {
        skipped.push({
          rowNumber: row.rowNumber,
          raw: row.raw,
          reason: 'BATCH_PROCESSING_ERROR',
          detail:
            outcome.reason instanceof Error ? outcome.reason.message : 'AI batch processing failed',
        });
      }
      continue;
    }

    const { crmRecords } = outcome.value;

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const crm = crmRecords[j];

      if (!crm) {
        skipped.push({
          rowNumber: row.rowNumber,
          raw: row.raw,
          reason: 'AI_EXTRACTION_FAILED',
          detail: 'No corresponding record returned by AI for this row',
        });
        continue;
      }

      if (!hasContactInfo(crm)) {
        skipped.push({
          rowNumber: row.rowNumber,
          raw: row.raw,
          reason: 'MISSING_EMAIL_AND_MOBILE',
          detail: 'Row has neither a valid email nor a mobile number',
        });
        continue;
      }

      records.push({ rowNumber: row.rowNumber, raw: row.raw, crm });
    }
  }

  // Keep both arrays ordered by original row number for a predictable UI.
  records.sort((a, b) => a.rowNumber - b.rowNumber);
  skipped.sort((a, b) => a.rowNumber - b.rowNumber);

  const processingTimeMs = Date.now() - startTime;

  logger.info(`Completed CSV extraction job ${jobId}`, {
    totalRows: rows.length,
    imported: records.length,
    skipped: skipped.length,
    batchesFailed,
    processingTimeMs,
  });

  return {
    jobId,
    totalRows: rows.length,
    totalImported: records.length,
    totalSkipped: skipped.length,
    batchesProcessed: batches.length - batchesFailed,
    batchesFailed,
    records,
    skipped,
    processingTimeMs,
  };
}
