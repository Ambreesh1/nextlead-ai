import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Protects the AI-processing endpoint from abuse. Since every request
 * triggers paid/rate-limited Gemini calls, this is applied specifically
 * to the /process route rather than globally.
 */
export const csvProcessRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many CSV processing requests. Please try again shortly.',
      code: 'RATE_LIMITED',
    },
  },
});
