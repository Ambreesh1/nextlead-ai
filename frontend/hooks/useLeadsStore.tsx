'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { ProcessCsvResult } from '@/types/crm';

const STORAGE_KEY = 'nextlead-last-import';

interface StoredImport {
  result: ProcessCsvResult;
  fileName: string;
  importedAt: string;
}

interface LeadsStoreValue {
  result: ProcessCsvResult | null;
  fileName: string | null;
  importedAt: string | null;
  isHydrated: boolean;
  setImportResult: (result: ProcessCsvResult, fileName: string) => void;
  clearImportResult: () => void;
}

const LeadsStoreContext = createContext<LeadsStoreValue | undefined>(undefined);

export function LeadsStoreProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<ProcessCsvResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importedAt, setImportedAt] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredImport = JSON.parse(raw);
        setResult(parsed.result);
        setFileName(parsed.fileName);
        setImportedAt(parsed.importedAt);
      }
    } catch {
      // Corrupted or unavailable storage - start fresh rather than crashing.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setImportResult = useCallback((newResult: ProcessCsvResult, newFileName: string) => {
    const now = new Date().toISOString();
    setResult(newResult);
    setFileName(newFileName);
    setImportedAt(now);

    try {
      const payload: StoredImport = { result: newResult, fileName: newFileName, importedAt: now };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage may be full or disabled (private browsing) - the in-memory
      // state still works for the current session, so we don't throw.
    }
  }, []);

  const clearImportResult = useCallback(() => {
    setResult(null);
    setFileName(null);
    setImportedAt(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<LeadsStoreValue>(
    () => ({ result, fileName, importedAt, isHydrated, setImportResult, clearImportResult }),
    [result, fileName, importedAt, isHydrated, setImportResult, clearImportResult]
  );

  return <LeadsStoreContext.Provider value={value}>{children}</LeadsStoreContext.Provider>;
}

export function useLeadsStore(): LeadsStoreValue {
  const ctx = useContext(LeadsStoreContext);
  if (!ctx) throw new Error('useLeadsStore must be used within a LeadsStoreProvider');
  return ctx;
}
