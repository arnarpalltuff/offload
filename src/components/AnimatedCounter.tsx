'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number | string;
  className?: string;
  suffix?: string;
  decimals?: number;
}

// Number that animates from 0 to target with an elastic spring
export default function AnimatedCounter({ value, className = '', suffix = '', decimals = 0 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('0');
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  useEffect(() => {
    if (!isInView || isNaN(numValue)) {
      if (typeof value === 'string' && isNaN(numValue)) setDisplay(value);
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numValue;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, numValue, decimals, value]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {display}{suffix}
    </motion.span>
  );
}
