import { ApiErrorBody, ApiSuccessBody, ProcessCsvResult } from '@/types/crm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/**
 * Uploads a CSV file to the backend for AI-powered CRM extraction.
 * This is only ever called AFTER the user has previewed the file and
 * clicked "Confirm import" - never automatically on file selection.
 */
export async function processCsvFile(
  file: File,
  signal?: AbortSignal
): Promise<ProcessCsvResult> {
  const formData = new FormData();
  formData.append('file', file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/csv/process`, {
      method: 'POST',
      body: formData,
      signal,
    });
  } catch (err) {
    throw new ApiError(
      'Could not reach the server. Check your connection and that the backend is running.',
      'NETWORK_ERROR',
      0
    );
  }

  let body: ApiSuccessBody<ProcessCsvResult> | ApiErrorBody;
  try {
    body = await response.json();
  } catch (err) {
    throw new ApiError('Server returned an unreadable response.', 'INVALID_RESPONSE', response.status);
  }

  if (!response.ok || !body.success) {
    const message = !body.success ? body.error.message : 'Something went wrong while processing the file.';
    const code = !body.success ? body.error.code : 'UNKNOWN_ERROR';
    throw new ApiError(message, code, response.status);
  }

  return body.data;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}
