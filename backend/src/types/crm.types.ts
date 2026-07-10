/**
 * GrowEasy CRM domain types.
 * These types define the canonical output schema that every uploaded
 * CSV (regardless of its original column names) must be mapped into.
 */

/** Allowed CRM lead statuses. The AI must choose exactly one of these, or null. */
export const CRM_STATUS_VALUES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
] as const;

export type CrmStatus = (typeof CRM_STATUS_VALUES)[number];

/** Allowed data source values. If the AI isn't confident, this must be left blank. */
export const DATA_SOURCE_VALUES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
] as const;

export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

/**
 * A single canonical GrowEasy CRM lead record.
 * All fields except `name`/`email`/`mobile_without_country_code` are optional
 * because source CSVs frequently omit them - the AI fills what it can find
 * and leaves the rest null.
 */
export interface CrmRecord {
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: CrmStatus | null;
  crm_note: string | null;
  data_source: DataSource | '' ;
  possession_time: string | null;
  description: string | null;
}

/** The ordered list of CRM fields, used for CSV/table column ordering. */
export const CRM_FIELDS: (keyof CrmRecord)[] = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
];

/** A raw row exactly as parsed from the uploaded CSV, before AI processing. */
export type RawCsvRow = Record<string, string>;

/** Why a raw row failed to make it into the final CRM output. */
export type SkipReason =
  | 'MISSING_EMAIL_AND_MOBILE'
  | 'AI_EXTRACTION_FAILED'
  | 'EMPTY_ROW'
  | 'BATCH_PROCESSING_ERROR';

export interface SkippedRecord {
  /** 1-indexed row number as it appeared in the original CSV (header excluded). */
  rowNumber: number;
  raw: RawCsvRow;
  reason: SkipReason;
  detail?: string;
}

export interface ExtractedRecord {
  rowNumber: number;
  raw: RawCsvRow;
  crm: CrmRecord;
}

/** Full response shape returned by POST /api/csv/process */
export interface ProcessCsvResult {
  jobId: string;
  totalRows: number;
  totalImported: number;
  totalSkipped: number;
  batchesProcessed: number;
  batchesFailed: number;
  records: ExtractedRecord[];
  skipped: SkippedRecord[];
  processingTimeMs: number;
}

/** Shape returned by the CSV preview endpoint / used purely client-side. */
export interface CsvPreview {
  headers: string[];
  rows: RawCsvRow[];
  totalRows: number;
}
