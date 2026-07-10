'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

/**
 * Animates a number counting up from its previous value to `value`
 * whenever `value` changes. Used for dashboard stat cards so imports and
 * updates feel alive rather than snapping instantly.
 */
export function AnimatedCounter({
  value,
  duration = 0.8,
  className,
  formatter = (v) => Math.round(v).toLocaleString('en-US'),
}: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const previousValue = useRef(0);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(previousValue.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate(latest) {
        node.textContent = formatter(latest);
      },
      onComplete() {
        previousValue.current = value;
      },
    });

    return () => controls.stop();
  }, [value, duration, formatter]);

  return (
    <span ref={nodeRef} className={className}>
      {formatter(0)}
    </span>
  );
}
