'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from './StatusBadge';
import { formatDate, titleCaseFromSnake } from '@/lib/utils';
import { ExtractedRecord } from '@/types/crm';

interface LeadsTableProps {
  records: ExtractedRecord[];
  selected: Set<number>;
  onToggleSelect: (rowNumber: number) => void;
  onToggleSelectAll: () => void;
  onRowClick: (record: ExtractedRecord) => void;
}

function initialsOf(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
}

export function LeadsTable({ records, selected, onToggleSelect, onToggleSelectAll, onRowClick }: LeadsTableProps) {
  const allSelected = records.length > 0 && records.every((r) => selected.has(r.rowNumber));

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={onToggleSelectAll} aria-label="Select all" />
            </TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow
              key={record.rowNumber}
              data-state={selected.has(record.rowNumber) ? 'selected' : undefined}
              className="cursor-pointer"
              onClick={() => onRowClick(record)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selected.has(record.rowNumber)}
                  onCheckedChange={() => onToggleSelect(record.rowNumber)}
                  aria-label={`Select ${record.crm.name ?? 'lead'}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px]">
                      {initialsOf(record.crm.name).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[160px] truncate font-medium text-foreground">
                    {record.crm.name || <span className="text-muted-foreground/50">Unnamed</span>}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[200px]">
                  <p className="truncate text-foreground/90">
                    {record.crm.email || <span className="text-muted-foreground/40">—</span>}
                  </p>
                  {record.crm.mobile_without_country_code && (
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {record.crm.country_code} {record.crm.mobile_without_country_code}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-[160px] truncate text-foreground/90">
                {record.crm.company || <span className="text-muted-foreground/40">—</span>}
              </TableCell>
              <TableCell>
                <StatusBadge status={record.crm.crm_status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {record.crm.data_source ? (
                  titleCaseFromSnake(record.crm.data_source)
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                {formatDate(record.crm.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
