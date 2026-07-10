import { Badge, BadgeProps } from '@/components/ui/badge';
import { CrmStatus } from '@/types/crm';

const STATUS_CONFIG: Record<CrmStatus, { label: string; variant: BadgeProps['variant'] }> = {
  GOOD_LEAD_FOLLOW_UP: { label: 'Follow up', variant: 'success' },
  DID_NOT_CONNECT: { label: 'Did not connect', variant: 'secondary' },
  BAD_LEAD: { label: 'Bad lead', variant: 'destructive' },
  SALE_DONE: { label: 'Sale done', variant: 'accent' },
};

export function StatusBadge({ status }: { status: CrmStatus | null }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground/50">—</span>;
  }

  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
