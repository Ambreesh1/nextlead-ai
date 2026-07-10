'use client';

import { ChangeEvent, DragEvent, useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isCsvFile } from '@/lib/csv';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFileSelected, disabled }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      setLocalError(null);

      if (!isCsvFile(file)) {
        setLocalError('Only .csv files are supported. Please choose a different file.');
        return;
      }

      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <motion.div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        aria-disabled={disabled}
        animate={isDragging ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
        className={cn(
          'group relative flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5',
          disabled && 'cursor-not-allowed opacity-50 hover:border-border hover:bg-card'
        )}
      >
        <motion.div
          animate={isDragging ? { scale: 1.15, rotate: -6 } : { scale: 1, rotate: 0 }}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
            isDragging ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
          )}
        >
          <UploadCloud size={26} strokeWidth={1.75} />
        </motion.div>

        <div>
          <p className="font-display text-base font-semibold text-foreground">
            Drag & drop your CSV here
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or <span className="font-medium text-primary">browse files</span> from your computer
          </p>
        </div>

        <p className="max-w-md text-xs text-muted-foreground">
          Works with Facebook Lead Ads, Google Ads, Excel exports, real-estate CRM dumps, or any
          spreadsheet — column names don&apos;t need to match anything.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onInputChange}
          disabled={disabled}
        />
      </motion.div>

      {localError && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <FileWarning size={15} className="shrink-0" />
          {localError}
        </div>
      )}
    </div>
  );
}
