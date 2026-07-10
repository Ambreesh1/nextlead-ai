'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ImportStep = 'upload' | 'preview' | 'processing' | 'success';

const STEPS: { key: ImportStep; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'preview', label: 'Preview' },
  { key: 'processing', label: 'Confirm & Import' },
  { key: 'success', label: 'Done' },
];

export function ImportSteps({ current }: { current: ImportStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex w-full items-center">
      {STEPS.map((step, idx) => {
        const isComplete = idx < currentIndex;
        const isActive = idx === currentIndex;

        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  isComplete && 'border-primary bg-primary text-primary-foreground',
                  isActive && 'border-primary bg-background text-primary',
                  !isComplete && !isActive && 'border-border bg-background text-muted-foreground'
                )}
              >
                {isComplete ? <Check size={15} /> : idx + 1}
              </div>
              <span
                className={cn(
                  'whitespace-nowrap text-[11px] font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground/60'
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="relative mx-2 h-px flex-1 bg-border">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={false}
                  animate={{ width: isComplete ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
