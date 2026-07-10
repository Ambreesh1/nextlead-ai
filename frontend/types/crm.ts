/**
 * These types mirror backend/src/types/crm.types.ts. Kept as a separate
 * copy (rather than a shared package) to keep the two services fully
 * independent and deployable on their own - a deliberate tradeoff for a
 * two-service assignment submission rather than a monorepo package setup.
 */

export const CRM_STATUS_VALUES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
] as const;

export type CrmStatus = (typeof CRM_STATUS_VALUES)[number];

export const DATA_SOURCE_VALUES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
] as const;

export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

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
  data_source: DataSource | '' | null;
  possession_time: string | null;
  description: string | null;
}

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

export type RawCsvRow = Record<string, string>;

export type SkipReason =
  | 'MISSING_EMAIL_AND_MOBILE'
  | 'AI_EXTRACTION_FAILED'
  | 'EMPTY_ROW'
  | 'BATCH_PROCESSING_ERROR';

export interface SkippedRecord {
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

export interface CsvPreview {
  headers: string[];
  rows: RawCsvRow[];
  totalRows: number;
}

export interface ApiErrorBody {
  success: false;
  error: {
    message: string;
    code: string;
    stack?: string;
  };
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
}
