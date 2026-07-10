'use client';

import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CRM_STATUS_VALUES, CrmStatus } from '@/types/crm';
import { titleCaseFromSnake } from '@/lib/utils';

const STATUS_LABELS: Record<CrmStatus, string> = {
  GOOD_LEAD_FOLLOW_UP: 'Follow up',
  DID_NOT_CONNECT: 'Did not connect',
  BAD_LEAD: 'Bad lead',
  SALE_DONE: 'Sale done',
};

interface LeadsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: CrmStatus | 'all';
  onStatusChange: (value: CrmStatus | 'all') => void;
  source: string;
  onSourceChange: (value: string) => void;
  availableSources: string[];
  onClear: () => void;
  hasActiveFilters: boolean;
}

export const LeadsFilters = forwardRef<HTMLInputElement, LeadsFiltersProps>(function LeadsFilters(
  { search, onSearchChange, status, onStatusChange, source, onSourceChange, availableSources, onClear, hasActiveFilters },
  ref
) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={ref}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, company, phone…"
          className="pl-8"
        />
      </div>

      <Select value={status} onValueChange={(v) => onStatusChange(v as CrmStatus | 'all')}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {CRM_STATUS_VALUES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={source} onValueChange={onSourceChange}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {availableSources.map((s) => (
            <SelectItem key={s} value={s}>
              {titleCaseFromSnake(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X size={13} /> Clear
        </Button>
      )}
    </div>
  );
});
