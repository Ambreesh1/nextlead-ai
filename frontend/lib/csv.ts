import Papa from 'papaparse';
import { CRM_FIELDS, CsvPreview, ExtractedRecord } from '@/types/crm';

export class CsvParseError extends Error {}

const MAX_PREVIEW_ROWS = 200;

/**
 * Parses a File into a preview shape entirely in the browser. This powers
 * Step 2 (Preview) - it must NOT trigger any backend/AI call, per the
 * assignment ("No AI processing should happen yet").
 */
export function parseCsvFileForPreview(file: File): Promise<CsvPreview> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = results.meta.fields ?? [];

        if (headers.length === 0) {
          reject(new CsvParseError('No columns could be detected in this file.'));
          return;
        }

        const allRows = results.data.filter((row) =>
          Object.values(row).some((v) => typeof v === 'string' && v.trim() !== '')
        );

        if (allRows.length === 0) {
          reject(new CsvParseError('This file has headers but no data rows.'));
          return;
        }

        resolve({
          headers,
          rows: allRows.slice(0, MAX_PREVIEW_ROWS),
          totalRows: allRows.length,
        });
      },
      error: (err) => {
        reject(new CsvParseError(err.message || 'Failed to parse this CSV file.'));
      },
    });
  });
}

export function isCsvFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
}

/**
 * Converts imported CRM records back into a downloadable CSV file and
 * triggers a browser download. Used by the "Export" action on the Leads
 * page - purely client-side, no backend round-trip needed since the data
 * is already in memory.
 */
export function exportLeadsToCsv(records: ExtractedRecord[], filename = 'nextlead-leads.csv'): void {
  const rows = records.map((r) =>
    Object.fromEntries(CRM_FIELDS.map((field) => [field, r.crm[field] ?? '']))
  );

  const csv = Papa.unparse(rows, { columns: CRM_FIELDS as string[] });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
