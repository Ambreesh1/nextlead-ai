'use client';

import Link from 'next/link';
import { CheckCircle2, ListChecks, Upload, Users, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/dashboard/StatCard';
import { LeadStatusChart } from '@/components/dashboard/LeadStatusChart';
import { LeadsOverTimeChart } from '@/components/dashboard/LeadsOverTimeChart';
import { TopSourcesChart } from '@/components/dashboard/TopSourcesChart';
import { RecentSkipped } from '@/components/dashboard/RecentSkipped';
import { Button } from '@/components/ui/button';
import { useLeadsStore } from '@/hooks/useLeadsStore';
import { getLeadsOverTime, getSourceBreakdown, getStatusBreakdown } from '@/lib/analytics';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { result, isHydrated, fileName } = useLeadsStore();

  if (!isHydrated) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Your lead import activity at a glance." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Your lead import activity at a glance." />
        <EmptyState
          icon={Upload}
          title="No imports yet"
          description="Upload your first CSV to see live stats, charts, and lead activity here."
          action={
            <Button asChild>
              <Link href="/dashboard/import">
                <Upload size={14} /> Import your first CSV
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const statusData = getStatusBreakdown(result.records);
  const sourceData = getSourceBreakdown(result.records);
  const timeSeriesData = getLeadsOverTime(result.records);
  const successRate = result.totalRows > 0 ? Math.round((result.totalImported / result.totalRows) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={fileName ? `Latest import: ${fileName}` : 'Your lead import activity at a glance.'}
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/import">
              <Upload size={13} /> New import
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total rows processed" value={result.totalRows} icon={ListChecks} />
        <StatCard label="Successfully imported" value={result.totalImported} icon={CheckCircle2} tone="success" />
        <StatCard label="Skipped rows" value={result.totalSkipped} icon={XCircle} tone="warning" />
        <StatCard label="Success rate" value={successRate} suffix="%" icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadsOverTimeChart data={timeSeriesData} />
        </div>
        <RecentSkipped skipped={result.skipped} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeadStatusChart data={statusData} />
        <TopSourcesChart data={sourceData} />
      </div>
    </div>
  );
}
