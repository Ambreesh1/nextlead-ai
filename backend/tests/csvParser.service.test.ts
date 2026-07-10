import { parseCsvBuffer, chunkRows } from '../src/services/csvParser.service';
import { BadRequestError } from '../src/utils/AppError';

describe('parseCsvBuffer', () => {
  it('parses a well-formed CSV into headers and rows', () => {
    const csv = 'Name,Email,Phone\nJohn Doe,john@example.com,9876543210\n';
    const { headers, rows } = parseCsvBuffer(Buffer.from(csv));

    expect(headers).toEqual(['Name', 'Email', 'Phone']);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      Name: 'John Doe',
      Email: 'john@example.com',
      Phone: '9876543210',
    });
  });

  it('handles arbitrary / non-standard column names', () => {
    const csv = 'Full Name,Contact Number,Lead Source\nJane Smith,9123456789,Facebook\n';
    const { headers, rows } = parseCsvBuffer(Buffer.from(csv));

    expect(headers).toEqual(['Full Name', 'Contact Number', 'Lead Source']);
    expect(rows[0]['Full Name']).toBe('Jane Smith');
  });

  it('trims header whitespace', () => {
    const csv = ' Name , Email \nJohn,john@example.com\n';
    const { headers } = parseCsvBuffer(Buffer.from(csv));
    expect(headers).toEqual(['Name', 'Email']);
  });

  it('filters out fully blank rows', () => {
    const csv = 'Name,Email\nJohn,john@example.com\n,\n';
    const { rows } = parseCsvBuffer(Buffer.from(csv));
    expect(rows).toHaveLength(1);
  });

  it('throws BadRequestError for an empty file', () => {
    expect(() => parseCsvBuffer(Buffer.from(''))).toThrow(BadRequestError);
  });

  it('throws BadRequestError when no headers are detected', () => {
    expect(() => parseCsvBuffer(Buffer.from('   \n   '))).toThrow(BadRequestError);
  });
});

describe('chunkRows', () => {
  it('splits rows into batches of the given size', () => {
    const rows = Array.from({ length: 7 }, (_, i) => i);
    const batches = chunkRows(rows, 3);

    expect(batches).toHaveLength(3);
    expect(batches[0]).toEqual([0, 1, 2]);
    expect(batches[1]).toEqual([3, 4, 5]);
    expect(batches[2]).toEqual([6]);
  });

  it('returns a single batch when batchSize >= rows.length', () => {
    const rows = [1, 2, 3];
    const batches = chunkRows(rows, 10);
    expect(batches).toHaveLength(1);
    expect(batches[0]).toEqual([1, 2, 3]);
  });

  it('throws for a non-positive batch size', () => {
    expect(() => chunkRows([1, 2], 0)).toThrow();
  });
});
