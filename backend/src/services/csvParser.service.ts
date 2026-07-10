import Papa from 'papaparse';
import { BadRequestError } from '../utils/AppError';
import { RawCsvRow } from '../types/crm.types';

export interface ParsedCsv {
  headers: string[];
  rows: RawCsvRow[];
}

/**
 * Parses raw CSV file content into header + row objects.
 * Deliberately does NOT assume any fixed column names - this is the whole
 * point of the assignment. Whatever headers the source file has, we keep
 * them as-is and let the AI extraction stage figure out the mapping.
 */
export function parseCsvBuffer(buffer: Buffer): ParsedCsv {
  const content = buffer.toString('utf-8');

  if (!content.trim()) {
    throw new BadRequestError('The uploaded CSV file is empty', 'EMPTY_FILE');
  }

  const result = Papa.parse<RawCsvRow>(content, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
    dynamicTyping: false,
  });

  // PapaParse collects row-level errors but keeps parsing - we only fail
  // hard on structural errors (e.g. unparsable file), not on a handful of
  // malformed rows, which real-world exports frequently contain.
  const fatalErrors = result.errors.filter((e) => e.type === 'Delimiter');
  if (fatalErrors.length > 0 && result.data.length === 0) {
    throw new BadRequestError(
      'Could not parse the file as CSV. Please check the file format.',
      'PARSE_ERROR'
    );
  }

  const headers = result.meta.fields ?? [];

  if (headers.length === 0) {
    throw new BadRequestError('No columns detected in the CSV file', 'NO_HEADERS');
  }

  // Filter out fully blank rows (all values empty/whitespace) that
  // `skipEmptyLines: 'greedy'` may still let through in edge cases.
  const rows = result.data.filter((row) =>
    Object.values(row).some((value) => typeof value === 'string' && value.trim() !== '')
  );

  return { headers, rows };
}

/** Splits an array of rows into fixed-size batches for AI processing. */
export function chunkRows<T>(rows: T[], batchSize: number): T[][] {
  if (batchSize <= 0) {
    throw new Error('batchSize must be greater than 0');
  }

  const batches: T[][] = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push(rows.slice(i, i + batchSize));
  }
  return batches;
}
