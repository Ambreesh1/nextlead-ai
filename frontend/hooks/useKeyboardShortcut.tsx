'use client';

import { useEffect } from 'react';

interface ShortcutOptions {
  /** Require Cmd (Mac) / Ctrl (Windows/Linux) to be held. */
  meta?: boolean;
  /** Prevent the default browser action (e.g. Cmd+K browser search). */
  preventDefault?: boolean;
  /** Skip firing while focus is inside an input/textarea/select. */
  ignoreInputs?: boolean;
  enabled?: boolean;
}

/**
 * Registers a global keyboard shortcut for as long as the component using
 * it is mounted. Used for the Cmd/Ctrl+K command palette and the "/" search
 * focus shortcut on the Leads page.
 */
export function useKeyboardShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {}
) {
  const { meta = false, preventDefault = true, ignoreInputs = false, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTypingContext =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (ignoreInputs && isTypingContext) return;

      const metaMatches = meta ? e.metaKey || e.ctrlKey : true;
      if (e.key.toLowerCase() === key.toLowerCase() && metaMatches) {
        if (preventDefault) e.preventDefault();
        handler(e);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, meta, preventDefault, ignoreInputs, enabled, handler]);
}
