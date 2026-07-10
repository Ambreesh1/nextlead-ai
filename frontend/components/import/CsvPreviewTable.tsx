'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CsvPreview } from '@/types/crm';

interface CsvPreviewTableProps {
  preview: CsvPreview;
}

export function CsvPreviewTable({ preview }: CsvPreviewTableProps) {
  const { headers, rows, totalRows } = preview;

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-foreground">Preview</h3>
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{rows.length}</span> of{' '}
          <span className="font-medium text-foreground">{totalRows}</span> rows &middot; {headers.length}{' '}
          columns detected
        </p>
      </div>

      <div className="max-h-[420px] overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky left-0 z-20 bg-muted">#</TableHead>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="sticky left-0 bg-inherit font-mono text-xs text-muted-foreground">
                  {idx + 1}
                </TableCell>
                {headers.map((header) => (
                  <TableCell
                    key={header}
                    className="max-w-[220px] truncate text-foreground/90"
                    title={row[header]}
                  >
                    {row[header] || <span className="text-muted-foreground/40">—</span>}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
