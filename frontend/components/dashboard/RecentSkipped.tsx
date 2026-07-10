import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkippedRecord } from '@/types/crm';

const REASON_LABELS: Record<string, string> = {
  MISSING_EMAIL_AND_MOBILE: 'No email or mobile',
  AI_EXTRACTION_FAILED: 'AI extraction failed',
  EMPTY_ROW: 'Empty row',
  BATCH_PROCESSING_ERROR: 'Batch failed',
};

export function RecentSkipped({ skipped }: { skipped: SkippedRecord[] }) {
  const recent = skipped.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skipped rows</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="flex items-center gap-2.5 rounded-lg bg-success/10 px-3 py-3 text-sm text-success">
            <CheckCircle2 size={16} className="shrink-0" />
            Every row from your last import had usable contact info.
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {recent.map((row) => (
              <li key={row.rowNumber} className="flex items-start gap-2.5 text-sm">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-warning" />
                <div className="min-w-0">
                  <p className="text-foreground/90">
                    Row #{row.rowNumber} &middot;{' '}
                    <span className="text-muted-foreground">
                      {REASON_LABELS[row.reason] ?? row.reason}
                    </span>
                  </p>
                </div>
              </li>
            ))}
            {skipped.length > 5 && (
              <p className="pt-1 text-xs text-muted-foreground">
                +{skipped.length - 5} more skipped row{skipped.length - 5 === 1 ? '' : 's'}
              </p>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
