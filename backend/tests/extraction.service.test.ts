import { CrmRecord, RawCsvRow } from '../src/types/crm.types';

jest.mock('../src/services/gemini.service', () => ({
  extractCrmBatch: jest.fn(),
}));

// eslint-disable-next-line import/first
import { extractCrmBatch } from '../src/services/gemini.service';
// eslint-disable-next-line import/first
import { processCsvRows } from '../src/services/extraction.service';

const mockedExtractCrmBatch = extractCrmBatch as jest.MockedFunction<typeof extractCrmBatch>;

function emptyCrm(overrides: Partial<CrmRecord> = {}): CrmRecord {
  return {
    created_at: null,
    name: null,
    email: null,
    country_code: null,
    mobile_without_country_code: null,
    company: null,
    city: null,
    state: null,
    country: null,
    lead_owner: null,
    crm_status: null,
    crm_note: null,
    data_source: null,
    possession_time: null,
    description: null,
    ...overrides,
  };
}

describe('processCsvRows', () => {
  beforeEach(() => {
    mockedExtractCrmBatch.mockReset();
  });

  it('imports rows that have an email or mobile, skips those without either', async () => {
    const headers = ['Name', 'Email', 'Phone'];
    const rows: RawCsvRow[] = [
      { Name: 'John', Email: 'john@example.com', Phone: '' },
      { Name: 'No Contact', Email: '', Phone: '' },
      { Name: 'Jane', Email: '', Phone: '9876543210' },
    ];

    mockedExtractCrmBatch.mockResolvedValueOnce([
      emptyCrm({ name: 'John', email: 'john@example.com' }),
      emptyCrm({ name: 'No Contact' }),
      emptyCrm({ name: 'Jane', mobile_without_country_code: '9876543210' }),
    ]);

    const result = await processCsvRows(headers, rows);

    expect(result.totalRows).toBe(3);
    expect(result.totalImported).toBe(2);
    expect(result.totalSkipped).toBe(1);
    expect(result.skipped[0].reason).toBe('MISSING_EMAIL_AND_MOBILE');
    expect(result.records.map((r) => r.crm.name)).toEqual(['John', 'Jane']);
  });

  it('splits rows into multiple batches according to CSV_BATCH_SIZE (2 in test env)', async () => {
    const headers = ['Name', 'Email'];
    const rows: RawCsvRow[] = [
      { Name: 'A', Email: 'a@example.com' },
      { Name: 'B', Email: 'b@example.com' },
      { Name: 'C', Email: 'c@example.com' },
    ];

    mockedExtractCrmBatch
      .mockResolvedValueOnce([
        emptyCrm({ name: 'A', email: 'a@example.com' }),
        emptyCrm({ name: 'B', email: 'b@example.com' }),
      ])
      .mockResolvedValueOnce([emptyCrm({ name: 'C', email: 'c@example.com' })]);

    const result = await processCsvRows(headers, rows);

    expect(mockedExtractCrmBatch).toHaveBeenCalledTimes(2);
    expect(result.totalImported).toBe(3);
    expect(result.batchesProcessed).toBe(2);
    expect(result.batchesFailed).toBe(0);
  });

  it('marks all rows in a failed batch as skipped, without failing the whole job', async () => {
    const headers = ['Name', 'Email'];
    const rows: RawCsvRow[] = [
      { Name: 'A', Email: 'a@example.com' },
      { Name: 'B', Email: 'b@example.com' },
    ];

    mockedExtractCrmBatch.mockRejectedValueOnce(new Error('AI service down'));

    const result = await processCsvRows(headers, rows);

    expect(result.totalImported).toBe(0);
    expect(result.totalSkipped).toBe(2);
    expect(result.batchesFailed).toBe(1);
    expect(result.skipped.every((s) => s.reason === 'BATCH_PROCESSING_ERROR')).toBe(true);
  });

  it('keeps records and skipped rows sorted by original row number', async () => {
    const headers = ['Name', 'Email'];
    const rows: RawCsvRow[] = [
      { Name: 'A', Email: 'a@example.com' },
      { Name: 'B', Email: '' },
      { Name: 'C', Email: 'c@example.com' },
    ];

    mockedExtractCrmBatch.mockResolvedValueOnce([
      emptyCrm({ name: 'A', email: 'a@example.com' }),
      emptyCrm({ name: 'B' }),
      emptyCrm({ name: 'C', email: 'c@example.com' }),
    ]);

    const result = await processCsvRows(headers, rows);
    expect(result.records.map((r) => r.rowNumber)).toEqual([1, 3]);
    expect(result.skipped.map((r) => r.rowNumber)).toEqual([2]);
  });
});
