import { crmRecordArraySchema } from '../src/utils/crmRecord.schema';

describe('crmRecordArraySchema', () => {
  it('accepts a well-formed record array', () => {
    const input = [
      {
        created_at: '2026-05-13 14:20:48',
        name: 'John Doe',
        email: 'john.doe@example.com',
        country_code: '+91',
        mobile_without_country_code: '9876543210',
        company: 'GrowEasy',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        lead_owner: 'test@gmail.com',
        crm_status: 'GOOD_LEAD_FOLLOW_UP',
        crm_note: 'Client is asking to reschedule demo',
        data_source: '',
        possession_time: null,
        description: null,
      },
    ];

    const result = crmRecordArraySchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('coerces an invalid crm_status to null instead of throwing', () => {
    const input = [
      {
        created_at: null,
        name: 'Jane',
        email: null,
        country_code: null,
        mobile_without_country_code: '9123456789',
        company: null,
        city: null,
        state: null,
        country: null,
        lead_owner: null,
        crm_status: 'TOTALLY_MADE_UP_STATUS',
        crm_note: null,
        data_source: null,
        possession_time: null,
        description: null,
      },
    ];

    const result = crmRecordArraySchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].crm_status).toBeNull();
    }
  });

  it('coerces an invalid data_source to empty string instead of throwing', () => {
    const input = [
      {
        created_at: null,
        name: 'Jane',
        email: null,
        country_code: null,
        mobile_without_country_code: '9123456789',
        company: null,
        city: null,
        state: null,
        country: null,
        lead_owner: null,
        crm_status: null,
        crm_note: null,
        data_source: 'not_a_real_source',
        possession_time: null,
        description: null,
      },
    ];

    const result = crmRecordArraySchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].data_source).toBe('');
    }
  });

  it('converts empty string fields to null', () => {
    const input = [
      {
        created_at: '',
        name: '   ',
        email: null,
        country_code: null,
        mobile_without_country_code: '9123456789',
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
      },
    ];

    const result = crmRecordArraySchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].created_at).toBeNull();
      expect(result.data[0].name).toBeNull();
    }
  });

  it('rejects a non-array payload', () => {
    const result = crmRecordArraySchema.safeParse({ not: 'an array' });
    expect(result.success).toBe(false);
  });
});
