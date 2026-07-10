import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'destructive';
  suffix?: string;
  formatter?: (value: number) => string;
}

const TONE_STYLES: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({ label, value, icon: Icon, tone = 'default', suffix, formatter }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TONE_STYLES[tone])}>
          <Icon size={17} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-xl font-semibold leading-tight text-foreground">
            <AnimatedCounter value={value} formatter={formatter} />
            {suffix}
          </p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}
