'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ImportSuccessStateProps {
  totalImported: number;
  totalSkipped: number;
}

export function ImportSuccessState({ totalImported, totalSkipped }: ImportSuccessStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success"
      >
        <CheckCircle2 size={30} />
      </motion.div>
      <div>
        <p className="font-display text-base font-semibold text-foreground">Import complete</p>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{totalImported}</span> lead
          {totalImported === 1 ? '' : 's'} imported
          {totalSkipped > 0 && (
            <>
              {' '}
              &middot; <span className="font-medium text-foreground">{totalSkipped}</span> skipped
            </>
          )}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Taking you to your leads…</p>
      </div>
    </Card>
  );
}
