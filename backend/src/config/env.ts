import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),

  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(10),
  CSV_BATCH_SIZE: z.coerce.number().int().positive().default(25),
  GEMINI_MAX_RETRIES: z.coerce.number().int().min(0).default(3),
  GEMINI_RETRY_DELAY_MS: z.coerce.number().int().min(0).default(1000),
  GEMINI_CONCURRENCY: z.coerce.number().int().positive().default(3),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(20),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:');
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten().fieldErrors);

    // In test environment, allow a fallback so unit tests can run without a real key.
    if (process.env.NODE_ENV === 'test') {
      return envSchema.parse({
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'test-key-placeholder',
      });
    }

    throw new Error('Invalid environment variables. See errors above.');
  }

  return parsed.data;
}

export const env = loadEnv();

export const CORS_ORIGINS = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
