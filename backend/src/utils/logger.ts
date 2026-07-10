/* eslint-disable no-console */
type LogMeta = Record<string, unknown>;

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, meta?: LogMeta): void {
    console.log(`[INFO] ${timestamp()} - ${message}`, meta ?? '');
  },
  warn(message: string, meta?: LogMeta): void {
    console.warn(`[WARN] ${timestamp()} - ${message}`, meta ?? '');
  },
  error(message: string, meta?: LogMeta): void {
    console.error(`[ERROR] ${timestamp()} - ${message}`, meta ?? '');
  },
  debug(message: string, meta?: LogMeta): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${timestamp()} - ${message}`, meta ?? '');
    }
  },
};
