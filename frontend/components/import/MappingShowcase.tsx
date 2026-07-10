'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SOURCE_SAMPLES = ['Contact Number', 'Full Name', 'Lead Email', 'Enquiry Status'];
const TARGET_SAMPLES = ['mobile_without_country_code', 'name', 'email', 'crm_status'];

export function MappingShowcase() {
  return (
    <Card className="hidden sm:block">
      <CardHeader>
        <CardTitle className="text-sm">How the mapping works</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Any column layout in
        </p>
        {SOURCE_SAMPLES.map((source, idx) => (
          <motion.div
            key={source}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="flex items-center gap-3 font-mono text-[12px]"
          >
            <span className="w-40 shrink-0 truncate rounded-md border border-dashed border-border bg-muted/60 px-2 py-1 text-muted-foreground">
              {source}
            </span>
            <ArrowRight size={13} className="shrink-0 text-primary/60" />
            <span className="truncate rounded-md bg-primary/10 px-2 py-1 font-medium text-primary">
              {TARGET_SAMPLES[idx]}
            </span>
          </motion.div>
        ))}
        <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          fixed NextLead CRM schema out
        </p>
      </CardContent>
    </Card>
  );
}
