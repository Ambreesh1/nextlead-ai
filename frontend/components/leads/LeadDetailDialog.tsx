'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, titleCaseFromSnake } from '@/lib/utils';
import { ExtractedRecord } from '@/types/crm';

interface LeadDetailDialogProps {
  record: ExtractedRecord | null;
  onOpenChange: (open: boolean) => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">
        {value || <span className="text-muted-foreground/50">—</span>}
      </p>
    </div>
  );
}

export function LeadDetailDialog({ record, onOpenChange }: LeadDetailDialogProps) {
  return (
    <Dialog open={!!record} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        {record && (
          <>
            <DialogHeader>
              <DialogTitle>{record.crm.name || 'Unnamed lead'}</DialogTitle>
              <DialogDescription>
                Row #{record.rowNumber} from the original CSV upload
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <StatusBadge status={record.crm.crm_status} />
              {record.crm.data_source && (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {titleCaseFromSnake(record.crm.data_source)}
                </span>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-h-[50vh] overflow-y-auto pr-1 themed-scroll">
              <Field label="Email" value={record.crm.email} />
              <Field
                label="Mobile"
                value={
                  record.crm.mobile_without_country_code
                    ? `${record.crm.country_code ?? ''} ${record.crm.mobile_without_country_code}`.trim()
                    : null
                }
              />
              <Field label="Company" value={record.crm.company} />
              <Field label="Lead owner" value={record.crm.lead_owner} />
              <Field label="City" value={record.crm.city} />
              <Field label="State" value={record.crm.state} />
              <Field label="Country" value={record.crm.country} />
              <Field label="Created at" value={formatDateTime(record.crm.created_at)} />
              <Field label="Possession time" value={record.crm.possession_time} />
              <div className="col-span-2">
                <Field label="Description" value={record.crm.description} />
              </div>
              <div className="col-span-2">
                <Field label="Notes" value={record.crm.crm_note} />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
