'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { UploadDropzone } from '@/components/import/UploadDropzone';
import { MappingShowcase } from '@/components/import/MappingShowcase';
import { CsvPreviewTable } from '@/components/import/CsvPreviewTable';
import { ProcessingAnimation } from '@/components/import/ProcessingAnimation';
import { ImportSuccessState } from '@/components/import/ImportSuccessState';
import { ImportSteps, ImportStep } from '@/components/import/ImportSteps';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseCsvFileForPreview, CsvParseError } from '@/lib/csv';
import { formatBytes } from '@/lib/utils';
import { processCsvFile, ApiError } from '@/lib/api';
import { useLeadsStore } from '@/hooks/useLeadsStore';
import { CsvPreview } from '@/types/crm';

const REDIRECT_DELAY_MS = 1600;

export default function ImportLeadsPage() {
  const router = useRouter();
  const { setImportResult } = useLeadsStore();

  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [isParsingPreview, setIsParsingPreview] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  const resetAll = useCallback(() => {
    setStep('upload');
    setFile(null);
    setPreview(null);
  }, []);

  const handleFileSelected = useCallback(async (selectedFile: File) => {
    setIsParsingPreview(true);
    try {
      const parsed = await parseCsvFileForPreview(selectedFile);
      setFile(selectedFile);
      setPreview(parsed);
      setStep('preview');
    } catch (err) {
      const message = err instanceof CsvParseError ? err.message : 'Could not parse this CSV file.';
      toast.error('Could not read file', { description: message });
    } finally {
      setIsParsingPreview(false);
    }
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (!file) return;
    setStep('processing');

    try {
      const data = await processCsvFile(file);
      setImportResult(data, file.name);
      setImportedCount(data.totalImported);
      setSkippedCount(data.totalSkipped);
      setStep('success');

      toast.success('Import complete', {
        description: `${data.totalImported} lead${data.totalImported === 1 ? '' : 's'} imported${
          data.totalSkipped > 0 ? `, ${data.totalSkipped} skipped` : ''
        }.`,
      });

      setTimeout(() => {
        router.push('/dashboard/leads');
      }, REDIRECT_DELAY_MS);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to process the CSV file. Please try again.';
      toast.error('Import failed', { description: message });
      setStep('preview');
    }
  }, [file, router, setImportResult]);

  return (
    <div>
      <PageHeader
        title="Import Leads"
        description="Upload a CSV in any layout — AI maps it onto your CRM schema automatically."
      />

      <Card className="mb-6 p-4 sm:p-5">
        <ImportSteps current={step} />
      </Card>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.section
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]"
          >
            <UploadDropzone onFileSelected={handleFileSelected} disabled={isParsingPreview} />
            <MappingShowcase />
          </motion.section>
        )}

        {step === 'preview' && preview && file && (
          <motion.section
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-5"
          >
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)} &middot; {preview.totalRows} rows detected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetAll}>
                  <UploadCloud size={13} /> Choose different file
                </Button>
                <Button size="sm" onClick={handleConfirmImport}>
                  <CheckCircle2 size={14} /> Confirm & Import with AI
                </Button>
              </div>
            </Card>

            <Card className="p-4 sm:p-5">
              <CsvPreviewTable preview={preview} />
            </Card>

            <p className="text-xs text-muted-foreground">
              This preview is generated entirely in your browser — no data has been sent to the
              server yet. Click <span className="font-medium">Confirm &amp; Import with AI</span> to
              start extraction.
            </p>
          </motion.section>
        )}

        {step === 'processing' && preview && (
          <motion.section key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProcessingAnimation totalRows={preview.totalRows} />
          </motion.section>
        )}

        {step === 'success' && (
          <motion.section key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ImportSuccessState totalImported={importedCount} totalSkipped={skippedCount} />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
