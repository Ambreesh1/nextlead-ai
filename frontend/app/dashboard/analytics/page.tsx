'use client';

import Link from 'next/link';
import { BarChart3, Upload } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LeadStatusChart } from '@/components/dashboard/LeadStatusChart';
import { LeadsOverTimeChart } from '@/components/dashboard/LeadsOverTimeChart';
import { TopSourcesChart } from '@/components/dashboard/TopSourcesChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeadsStore } from '@/hooks/useLeadsStore';
import { getLeadsOverTime, getSourceBreakdown, getStatusBreakdown } from '@/lib/analytics';

export default function AnalyticsPage() {
  const { result, isHydrated } = useLeadsStore();

  if (!isHydrated) {
    return (
      <div>
        <PageHeader title="Analytics" description="Breakdown of your imported lead data." />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  if (!result || result.records.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" description="Breakdown of your imported lead data." />
        <EmptyState
          icon={BarChart3}
          title="Nothing to analyze yet"
          description="Import leads first, then come back here to see trends and breakdowns."
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

  const statusData = getStatusBreakdown(result.records);
  const sourceData = getSourceBreakdown(result.records);
  const timeSeriesData = getLeadsOverTime(result.records);
  const totalWithSource = sourceData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <PageHeader title="Analytics" description="Breakdown of your imported lead data." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeadStatusChart data={statusData} />
        <TopSourcesChart data={sourceData} />
      </div>

      <div className="mt-4">
        <LeadsOverTimeChart data={timeSeriesData} />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Source breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Source</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sourceData.map((row) => (
                <TableRow key={row.source}>
                  <TableCell className="font-medium text-foreground">{row.label}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.count}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {totalWithSource > 0 ? Math.round((row.count / totalWithSource) * 100) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
