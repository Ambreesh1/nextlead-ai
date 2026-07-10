process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key-placeholder';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.CSV_BATCH_SIZE = '2';
process.env.GEMINI_CONCURRENCY = '2';
process.env.GEMINI_MAX_RETRIES = '0';
process.env.GEMINI_RETRY_DELAY_MS = '1';
