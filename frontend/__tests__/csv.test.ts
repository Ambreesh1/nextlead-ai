import { isCsvFile } from '@/lib/csv';
import { formatBytes } from '@/lib/utils';

function makeFile(name: string, type: string): File {
  return new File(['col1,col2\nval1,val2'], name, { type });
}

describe('isCsvFile', () => {
  it('accepts files with a .csv extension', () => {
    expect(isCsvFile(makeFile('leads.csv', ''))).toBe(true);
  });

  it('accepts files with a text/csv mime type even without .csv extension', () => {
    expect(isCsvFile(makeFile('leads', 'text/csv'))).toBe(true);
  });

  it('rejects non-csv files', () => {
    expect(isCsvFile(makeFile('leads.xlsx', 'application/vnd.ms-excel'))).toBe(false);
  });

  it('is case-insensitive on extension', () => {
    expect(isCsvFile(makeFile('LEADS.CSV', ''))).toBe(true);
  });
});

describe('formatBytes', () => {
  it('formats bytes under 1KB as-is', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats KB range with one decimal', () => {
    expect(formatBytes(2048)).toBe('2.0 KB');
  });

  it('formats MB range with two decimals', () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB');
  });
});
