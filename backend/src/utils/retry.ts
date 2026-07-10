import { logger } from './logger';

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  /** Optional label used only in log lines. */
  label?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async operation with exponential backoff + jitter.
 * Used around Gemini calls, which can transiently fail (rate limits,
 * network blips, momentarily malformed JSON output).
 */
export async function retryWithBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, baseDelayMs, label = 'operation' } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries;

      logger.warn(`${label} failed on attempt ${attempt + 1}/${maxRetries + 1}`, {
        error: error instanceof Error ? error.message : String(error),
      });

      if (isLastAttempt) break;

      const jitter = Math.random() * 250;
      const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
      await sleep(delay);
    }
  }

  throw lastError;
}
