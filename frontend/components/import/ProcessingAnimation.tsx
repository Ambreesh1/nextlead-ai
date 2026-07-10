'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

const STATUS_MESSAGES = [
  'Uploading CSV to the server…',
  'Parsing rows and detecting columns…',
  'Mapping fields onto the NextLead CRM schema with AI…',
  'Validating extracted records…',
  'Almost done — finalizing results…',
];

interface ProcessingAnimationProps {
  totalRows: number;
}

/**
 * Batches are processed server-side and returned as a single response (no
 * SSE/streaming in this build). Progress here is a bounded simulation:
 * it advances toward ~92% based on an estimate proportional to row count,
 * then the parent snaps it to 100% the moment the real response arrives.
 */
export function ProcessingAnimation({ totalRows }: ProcessingAnimationProps) {
  const [progress, setProgress] = useState(4);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const estimatedMs = Math.min(45000, Math.max(4000, (totalRows / 5) * 1200));
    const tickMs = 180;
    const increment = (92 / estimatedMs) * tickMs;

    const interval = setInterval(() => {
      setProgress((p) => Math.min(92, p + increment));
    }, tickMs);

    return () => clearInterval(interval);
  }, [totalRows]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => Math.min(STATUS_MESSAGES.length - 1, i + 1));
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="flex flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-primary/15"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.25, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.div
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground"
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={20} />
        </motion.div>
      </div>

      <div>
        <p className="font-display text-base font-semibold text-foreground">
          Extracting CRM records with AI
        </p>
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 min-h-[20px] text-sm text-muted-foreground"
        >
          {STATUS_MESSAGES[messageIndex]}
        </motion.p>
      </div>

      <div className="w-full max-w-sm">
        <Progress value={progress} />
        <p className="mt-2 text-xs text-muted-foreground">
          Processing {totalRows} row{totalRows === 1 ? '' : 's'} in batches — this can take a moment
          for larger files.
        </p>
      </div>
    </Card>
  );
}
