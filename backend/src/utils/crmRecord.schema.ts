import { z } from 'zod';
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from '../types/crm.types';

/**
 * Validates the shape of each record returned by the AI. We deliberately
 * coerce anything unexpected (wrong enum values, wrong types) down to null
 * rather than throwing per-field, since a single malformed field shouldn't
 * blow up an otherwise-good record extracted for a whole batch. Only
 * structural failures (not an object, wrong key set entirely) are rejected.
 */

const nullableString = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined) return null;
    const str = String(val).trim();
    return str === '' ? null : str;
  });

const crmStatusField = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val) return null;
    return (CRM_STATUS_VALUES as readonly string[]).includes(val)
      ? (val as (typeof CRM_STATUS_VALUES)[number])
      : null;
  });

const dataSourceField = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val) return '';
    return (DATA_SOURCE_VALUES as readonly string[]).includes(val)
      ? (val as (typeof DATA_SOURCE_VALUES)[number])
      : '';
  });

export const crmRecordSchema = z.object({
  created_at: nullableString,
  name: nullableString,
  email: nullableString,
  country_code: nullableString,
  mobile_without_country_code: nullableString,
  company: nullableString,
  city: nullableString,
  state: nullableString,
  country: nullableString,
  lead_owner: nullableString,
  crm_status: crmStatusField,
  crm_note: nullableString,
  data_source: dataSourceField,
  possession_time: nullableString,
  description: nullableString,
});

export const crmRecordArraySchema = z.array(crmRecordSchema);
