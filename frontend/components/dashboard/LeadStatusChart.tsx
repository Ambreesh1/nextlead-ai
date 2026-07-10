'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { PieChart as PieChartIcon } from 'lucide-react';
import { StatusBreakdownDatum, CHART_COLORS } from '@/lib/analytics';

interface LeadStatusChartProps {
  data: StatusBreakdownDatum[];
}

export function LeadStatusChart({ data }: LeadStatusChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead status breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={PieChartIcon} title="No status data" className="border-none py-10" />
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-[180px] w-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={CHART_COLORS[entry.status as keyof typeof CHART_COLORS] ?? 'hsl(var(--border))'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-xl font-semibold text-foreground">{total}</span>
                <span className="text-[10px] text-muted-foreground">total</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {data.map((entry) => (
                <div key={entry.status} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_COLORS[entry.status as keyof typeof CHART_COLORS] ?? 'hsl(var(--border))',
                      }}
                    />
                    <span className="text-foreground/90">{entry.label}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {entry.count} &middot; {total > 0 ? Math.round((entry.count / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
