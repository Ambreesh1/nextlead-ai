import { CRM_STATUS_VALUES, CrmStatus, ExtractedRecord } from '@/types/crm';

export interface StatusBreakdownDatum {
  status: CrmStatus | 'Unspecified';
  label: string;
  count: number;
}

const STATUS_LABELS: Record<CrmStatus, string> = {
  GOOD_LEAD_FOLLOW_UP: 'Follow up',
  DID_NOT_CONNECT: 'Did not connect',
  BAD_LEAD: 'Bad lead',
  SALE_DONE: 'Sale done',
};

export function getStatusBreakdown(records: ExtractedRecord[]): StatusBreakdownDatum[] {
  const counts = new Map<string, number>();

  for (const record of records) {
    const key = record.crm.crm_status ?? 'Unspecified';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const ordered: StatusBreakdownDatum[] = CRM_STATUS_VALUES.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: counts.get(status) ?? 0,
  }));

  const unspecified = counts.get('Unspecified') ?? 0;
  if (unspecified > 0) {
    ordered.push({ status: 'Unspecified', label: 'Unspecified', count: unspecified });
  }

  return ordered.filter((d) => d.count > 0);
}

export interface SourceBreakdownDatum {
  source: string;
  label: string;
  count: number;
}

export function getSourceBreakdown(records: ExtractedRecord[]): SourceBreakdownDatum[] {
  const counts = new Map<string, number>();

  for (const record of records) {
    const raw = record.crm.data_source;
    const key = raw && raw.trim() !== '' ? raw : 'unspecified';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([source, count]) => ({
      source,
      label:
        source === 'unspecified'
          ? 'Unspecified'
          : source
              .split('_')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export interface TimeSeriesDatum {
  date: string;
  label: string;
  count: number;
}

/** Buckets records by created_at day. Records with no/unparseable date are excluded. */
export function getLeadsOverTime(records: ExtractedRecord[]): TimeSeriesDatum[] {
  const counts = new Map<string, number>();

  for (const record of records) {
    const raw = record.crm.created_at;
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;

    const dayKey = date.toISOString().slice(0, 10);
    counts.set(dayKey, (counts.get(dayKey) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }));
}

export const CHART_COLORS = {
  GOOD_LEAD_FOLLOW_UP: 'hsl(var(--primary))',
  DID_NOT_CONNECT: 'hsl(var(--muted-foreground))',
  BAD_LEAD: 'hsl(var(--destructive))',
  SALE_DONE: 'hsl(var(--accent))',
  Unspecified: 'hsl(var(--border))',
} as const;
