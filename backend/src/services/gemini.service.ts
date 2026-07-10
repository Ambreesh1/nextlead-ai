import { getGeminiModel } from '../config/gemini';
import { buildBatchPrompt } from '../prompts/crmExtraction.prompt';
import { crmRecordArraySchema } from '../utils/crmRecord.schema';
import { retryWithBackoff } from '../utils/retry';
import { logger } from '../utils/logger';
import { ExternalServiceError } from '../utils/AppError';
import { CrmRecord, RawCsvRow } from '../types/crm.types';
import { env } from '../config/env';

/**
 * Strips accidental markdown code fences from a model response, in case
 * the model ignores the "no markdown" instruction (happens occasionally
 * even with responseMimeType: 'application/json').
 */
function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

/**
 * Sends a single batch of raw CSV rows to Gemini and returns validated
 * CrmRecord objects in the same order as the input rows. Throws
 * ExternalServiceError if the model output can't be salvaged after retries.
 */
export async function extractCrmBatch(
  headers: string[],
  rows: RawCsvRow[]
): Promise<CrmRecord[]> {
  if (rows.length === 0) return [];

  const prompt = buildBatchPrompt(headers, rows);

  const rawText = await retryWithBackoff(
    async () => {
      const model = getGeminiModel();
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = result.response.text();
      if (!text || !text.trim()) {
        throw new Error('Gemini returned an empty response');
      }
      return text;
    },
    {
      maxRetries: env.GEMINI_MAX_RETRIES,
      baseDelayMs: env.GEMINI_RETRY_DELAY_MS,
      label: `Gemini batch (${rows.length} rows)`,
    }
  ).catch((error) => {
    logger.error('Gemini batch failed after all retries', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new ExternalServiceError(
      'AI extraction service is currently unavailable. Please try again.',
      'GEMINI_UNAVAILABLE'
    );
  });

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripCodeFences(rawText));
  } catch (parseError) {
    logger.error('Failed to parse Gemini JSON response', {
      snippet: rawText.slice(0, 500),
      error: parseError instanceof Error ? parseError.message : String(parseError),
    });
    throw new ExternalServiceError(
      'AI service returned an unexpected response format.',
      'GEMINI_INVALID_JSON'
    );
  }

  const validation = crmRecordArraySchema.safeParse(parsedJson);
  if (!validation.success) {
    logger.error('Gemini response failed schema validation', {
      issues: validation.error.issues.slice(0, 5),
    });
    throw new ExternalServiceError(
      'AI service returned data in an unexpected shape.',
      'GEMINI_SCHEMA_MISMATCH'
    );
  }

  if (validation.data.length !== rows.length) {
    logger.warn('Gemini returned a different number of records than requested', {
      expected: rows.length,
      received: validation.data.length,
    });
    // Pad or truncate defensively so downstream row-number alignment
    // never throws - missing records become "all null" and will be
    // caught by the skip rule (no email/mobile) at the orchestration layer.
    const emptyRecord: CrmRecord = {
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
      data_source: "",
      possession_time: null,
      description: null,
    };
    const adjusted = [...validation.data];
    while (adjusted.length < rows.length) adjusted.push(emptyRecord);
    adjusted.length = rows.length;
    return adjusted;
  }

  return validation.data;
}
