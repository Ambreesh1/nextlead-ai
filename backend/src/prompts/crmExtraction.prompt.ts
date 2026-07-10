import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from '../types/crm.types';
import { RawCsvRow } from '../types/crm.types';

/**
 * SYSTEM INSTRUCTIONS
 *
 * This is the most important piece of the assignment: it must reliably map
 * arbitrary, messy, differently-shaped CSV exports (Facebook lead ads,
 * Google Ads, real-estate CRM dumps, hand-made spreadsheets, ...) onto a
 * single fixed GrowEasy CRM schema.
 *
 * Design principles used here:
 * 1. Be explicit and exhaustive about every field, including what NOT to do
 *    (e.g. never invent a data_source, never invent a crm_status).
 * 2. Give the model an "escape hatch" (crm_note) so it isn't tempted to
 *    force poorly-fitting data into a structured field.
 * 3. Ask for strict, schema-shaped JSON output only - no prose, no markdown
 *    fences - since we parse the response programmatically.
 * 4. Preserve row order and count exactly, so the caller can zip the
 *    response back up with the original rows (and their row numbers).
 */
export const CRM_SYSTEM_INSTRUCTIONS = `You are a meticulous data-mapping engine for GrowEasy, a real-estate CRM platform.

Your job: given raw rows from an arbitrary CSV export (Facebook Lead Ads, Google Ads, Excel exports, real-estate CRM dumps, sales reports, marketing agency sheets, or manually created spreadsheets), map each row's available fields into the FIXED GrowEasy CRM schema below. Column names in the source data vary wildly and are NEVER guaranteed to match the target field names - you must infer meaning from column names, sample values, and context (e.g. a column called "Phone", "Mobile No", "Contact Number", "WhatsApp" or similar all likely map to a phone number field; "Full Name", "Lead Name", "Client" likely map to name).

TARGET SCHEMA (return exactly these keys for every record, in this order):
- created_at: Lead creation date/time. MUST be a string parseable by JavaScript's \`new Date(value)\`. Prefer ISO-like "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD". If the source has a date in any format (e.g. "13/05/2026", "May 13 2026"), normalize it to "YYYY-MM-DD HH:mm:ss" (use "00:00:00" if no time is given). If no date-like column exists, use null.
- name: The lead's full name. If only a first/last name are given separately, combine them. null if not found.
- email: The PRIMARY email address only (see multi-value rule below).
- country_code: Phone country code including the leading "+" (e.g. "+91"). Infer from the number format if possible, otherwise null.
- mobile_without_country_code: The phone number itself, WITHOUT the country code and without spaces/dashes. Digits only where possible.
- company: Company / organization / business name. null if not found.
- city: City name. null if not found.
- state: State / province name. null if not found.
- country: Country name. null if not found.
- lead_owner: The salesperson / agent / owner assigned to this lead (often an email or name). null if not found.
- crm_status: MUST be exactly one of: ${CRM_STATUS_VALUES.join(', ')} — or null if the source gives no signal about lead status/outcome. NEVER invent a new status string. Map similar-meaning source values sensibly (e.g. "Interested" / "Follow up" -> GOOD_LEAD_FOLLOW_UP; "Not reachable" / "No response" -> DID_NOT_CONNECT; "Not interested" / "Junk" -> BAD_LEAD; "Closed won" / "Converted" -> SALE_DONE).
- crm_note: Free-text notes. Use this field for: any remarks/comments column, follow-up notes, AND any extra email addresses or phone numbers beyond the first one (see rule below), and any other useful information from the row that doesn't fit a structured field above. Combine multiple pieces of info with "; " separators. null if nothing applies. NEVER include raw newline characters in this field - if you must represent a line break, use the literal two characters "\\n" (backslash n) instead of an actual newline, so the value stays a single logical CSV/JSON field.
- data_source: MUST be exactly one of: ${DATA_SOURCE_VALUES.join(', ')} — or an empty string "" if you are not CONFIDENTLY sure which one applies. Do not guess. NEVER invent a value outside this list.
- possession_time: Property possession timeframe/date, if this is a real-estate lead export (e.g. "Ready to move", "Dec 2026"). null if not applicable/found.
- description: Any additional descriptive text about the lead or property interest that doesn't belong in crm_note. null if not found.

CRITICAL RULES:
1. Multiple emails in one row: use the FIRST valid email as "email"; append any remaining emails into "crm_note" (e.g. "Additional email: foo@bar.com").
2. Multiple phone numbers in one row: use the FIRST valid phone as "mobile_without_country_code" (+ "country_code"); append any remaining numbers into "crm_note" (e.g. "Additional phone: 9876500000").
3. Never fabricate data. If a field cannot be determined from the row, use null (or "" specifically for data_source when unsure).
4. crm_status and data_source values must ONLY come from their allowed lists above, verbatim, or be null / "" respectively.
5. Preserve the exact number and order of input rows in your output array - one output object per input row, in the same order. Do not skip, merge, reorder, or add rows, even if a row looks unusable (the caller decides what to do with low-quality rows).
6. Output STRICT JSON ONLY: a JSON array of objects matching the schema above. No markdown code fences, no explanations, no extra keys, no trailing commas.`;

/**
 * Builds the user-turn prompt for a single batch of raw CSV rows.
 * We send the rows as JSON (rather than raw CSV text) because it removes
 * all ambiguity around delimiters/quoting and lets Gemini focus purely on
 * the semantic mapping task.
 */
export function buildBatchPrompt(headers: string[], rows: RawCsvRow[]): string {
  const rowsJson = JSON.stringify(rows, null, 0);

  return `Source CSV columns detected: ${JSON.stringify(headers)}

Below is a batch of ${rows.length} raw row(s) from the source CSV, as a JSON array (each object's keys are the original column names exactly as they appeared in the file):

${rowsJson}

Return a JSON array with exactly ${rows.length} object(s), one per input row in the same order, each following the target GrowEasy CRM schema described in the system instructions. Return JSON only.`;
}
