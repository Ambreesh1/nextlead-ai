'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, Trash2, Upload, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LeadsFilters } from '@/components/leads/LeadsFilters';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadsPagination } from '@/components/leads/LeadsPagination';
import { LeadsTableSkeleton } from '@/components/leads/LeadsTableSkeleton';
import { LeadDetailDialog } from '@/components/leads/LeadDetailDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLeadsStore } from '@/hooks/useLeadsStore';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { exportLeadsToCsv } from '@/lib/csv';
import { CrmStatus, ExtractedRecord } from '@/types/crm';

const PAGE_SIZE = 10;

export default function LeadsPage() {
  const { result, isHydrated, fileName, clearImportResult } = useLeadsStore();
  const searchRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CrmStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeRecord, setActiveRecord] = useState<ExtractedRecord | null>(null);

  useKeyboardShortcut('/', () => searchRef.current?.focus(), { ignoreInputs: true });

  const availableSources = useMemo(() => {
    if (!result) return [];
    const set = new Set<string>();
    for (const r of result.records) {
      set.add(r.crm.data_source && r.crm.data_source.trim() !== '' ? r.crm.data_source : 'unspecified');
    }
    return Array.from(set).sort();
  }, [result]);

  const filteredRecords = useMemo(() => {
    if (!result) return [];
    const query = search.trim().toLowerCase();

    return result.records.filter((r) => {
      if (statusFilter !== 'all' && r.crm.crm_status !== statusFilter) return false;

      if (sourceFilter !== 'all') {
        const src = r.crm.data_source && r.crm.data_source.trim() !== '' ? r.crm.data_source : 'unspecified';
        if (src !== sourceFilter) return false;
      }

      if (query) {
        const haystack = [r.crm.name, r.crm.email, r.crm.company, r.crm.mobile_without_country_code]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [result, search, statusFilter, sourceFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasActiveFilters = search !== '' || statusFilter !== 'all' || sourceFilter !== 'all';

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }
  function updateStatus(value: CrmStatus | 'all') {
    setStatusFilter(value);
    setPage(1);
  }
  function updateSource(value: string) {
    setSourceFilter(value);
    setPage(1);
  }
  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
    setSourceFilter('all');
    setPage(1);
  }

  function toggleSelect(rowNumber: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const allOnPageSelected = paginatedRecords.every((r) => prev.has(r.rowNumber));
      const next = new Set(prev);
      if (allOnPageSelected) {
        paginatedRecords.forEach((r) => next.delete(r.rowNumber));
      } else {
        paginatedRecords.forEach((r) => next.add(r.rowNumber));
      }
      return next;
    });
  }

  function handleExport() {
    if (!result) return;
    const toExport =
      selected.size > 0 ? result.records.filter((r) => selected.has(r.rowNumber)) : filteredRecords;
    exportLeadsToCsv(toExport, `nextlead-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Export started', {
      description: `${toExport.length} lead${toExport.length === 1 ? '' : 's'} exported to CSV.`,
    });
  }

  function handleClearImport() {
    clearImportResult();
    setSelected(new Set());
    toast('Leads cleared', { description: 'Your imported leads have been removed from this session.' });
  }

  if (!isHydrated) {
    return (
      <div>
        <PageHeader title="Leads" description="All leads imported from your CSV uploads." />
        <LeadsTableSkeleton />
      </div>
    );
  }

  if (!result || result.records.length === 0) {
    return (
      <div>
        <PageHeader title="Leads" description="All leads imported from your CSV uploads." />
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Import a CSV to see your AI-extracted leads here, ready to search, filter, and export."
          action={
            <Button asChild>
              <Link href="/dashboard/import">
                <Upload size={14} /> Import Leads
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description={
          fileName
            ? `${result.totalImported} leads imported from ${fileName}`
            : `${result.totalImported} leads imported`
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={13} />
              Export {selected.size > 0 ? `(${selected.size})` : 'CSV'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearImport} className="text-destructive hover:text-destructive">
              <Trash2 size={13} /> Clear
            </Button>
          </>
        }
      />

      <Card className="mb-4 p-3">
        <LeadsFilters
          ref={searchRef}
          search={search}
          onSearchChange={updateSearch}
          status={statusFilter}
          onStatusChange={updateStatus}
          source={sourceFilter}
          onSourceChange={updateSource}
          availableSources={availableSources}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </Card>

      {filteredRecords.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matching leads"
          description="Try adjusting your search or filters."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <LeadsTable
            records={paginatedRecords}
            selected={selected}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onRowClick={setActiveRecord}
          />
          <LeadsPagination
            page={currentPage}
            pageCount={pageCount}
            pageSize={PAGE_SIZE}
            totalItems={filteredRecords.length}
            onPageChange={setPage}
          />
        </Card>
      )}

      <LeadDetailDialog record={activeRecord} onOpenChange={(open) => !open && setActiveRecord(null)} />
    </div>
  );
}
