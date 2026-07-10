import { getStatusBreakdown, getSourceBreakdown, getLeadsOverTime } from '@/lib/analytics';
import { CrmRecord, ExtractedRecord } from '@/types/crm';

function makeRecord(rowNumber: number, overrides: Partial<CrmRecord> = {}): ExtractedRecord {
  const crm: CrmRecord = {
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
  return { rowNumber, raw: {}, crm };
}

describe('getStatusBreakdown', () => {
  it('counts records per status and excludes zero-count statuses', () => {
    const records = [
      makeRecord(1, { crm_status: 'GOOD_LEAD_FOLLOW_UP' }),
      makeRecord(2, { crm_status: 'GOOD_LEAD_FOLLOW_UP' }),
      makeRecord(3, { crm_status: 'SALE_DONE' }),
    ];

    const result = getStatusBreakdown(records);
    expect(result).toEqual([
      { status: 'GOOD_LEAD_FOLLOW_UP', label: 'Follow up', count: 2 },
      { status: 'SALE_DONE', label: 'Sale done', count: 1 },
    ]);
  });

  it('groups null statuses as Unspecified', () => {
    const records = [makeRecord(1, { crm_status: null }), makeRecord(2, { crm_status: null })];
    const result = getStatusBreakdown(records);
    expect(result).toEqual([{ status: 'Unspecified', label: 'Unspecified', count: 2 }]);
  });
});

describe('getSourceBreakdown', () => {
  it('groups by data_source and sorts descending by count', () => {
    const records = [
      makeRecord(1, { data_source: 'eden_park' }),
      makeRecord(2, { data_source: 'eden_park' }),
      makeRecord(3, { data_source: 'meridian_tower' }),
    ];

    const result = getSourceBreakdown(records);
    expect(result[0]).toEqual({ source: 'eden_park', label: 'Eden Park', count: 2 });
    expect(result[1]).toEqual({ source: 'meridian_tower', label: 'Meridian Tower', count: 1 });
  });

  it('treats blank data_source as unspecified', () => {
    const records = [makeRecord(1, { data_source: '' }), makeRecord(2, { data_source: null })];
    const result = getSourceBreakdown(records);
    expect(result).toEqual([{ source: 'unspecified', label: 'Unspecified', count: 2 }]);
  });
});

describe('getLeadsOverTime', () => {
  it('buckets records by day and sorts chronologically', () => {
    const records = [
      makeRecord(1, { created_at: '2026-05-13 10:00:00' }),
      makeRecord(2, { created_at: '2026-05-13 18:00:00' }),
      makeRecord(3, { created_at: '2026-05-12 09:00:00' }),
    ];

    const result = getLeadsOverTime(records);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2026-05-12');
    expect(result[0].count).toBe(1);
    expect(result[1].date).toBe('2026-05-13');
    expect(result[1].count).toBe(2);
  });

  it('excludes records with missing or unparseable dates', () => {
    const records = [
      makeRecord(1, { created_at: null }),
      makeRecord(2, { created_at: 'not a date' }),
      makeRecord(3, { created_at: '2026-05-13' }),
    ];

    const result = getLeadsOverTime(records);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(1);
  });
});
