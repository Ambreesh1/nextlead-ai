import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });
});

describe('POST /api/csv/process', () => {
  it('returns 400 when no file is attached', async () => {
    const res = await request(app).post('/api/csv/process');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NO_FILE');
  });

  it('rejects non-csv files', async () => {
    const res = await request(app)
      .post('/api/csv/process')
      .attach('file', Buffer.from('not a csv'), {
        filename: 'notes.txt',
        contentType: 'application/octet-stream',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for a CSV with headers but no data rows', async () => {
    const res = await request(app)
      .post('/api/csv/process')
      .attach('file', Buffer.from('Name,Email\n'), {
        filename: 'empty.csv',
        contentType: 'text/csv',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NO_DATA_ROWS');
  });
});

describe('Unmatched routes', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
