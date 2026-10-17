import React, { useEffect, useState } from 'react';

interface ServerWakeNoticeProps {
  /** Whether data is still loading */
  active: boolean;
  /** How long to wait before showing the notice */
  delayMs?: number;
  className?: string;
}

/**
 * The API runs on a free hosting tier that sleeps when idle, so the first request
 * after a quiet spell can take 30-60 seconds. Tell the visitor instead of leaving
 * them looking at skeletons with no explanation.
 */
const ServerWakeNotice: React.FC<ServerWakeNoticeProps> = ({ active, delayMs = 4000, className = '' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  if (!visible) return null;

  return (
    <p role="status" aria-live="polite" className={`text-center text-sm text-gray-500 ${className}`}>
      Waking up the store&apos;s server. The first load after a quiet spell can take up to a minute.
    </p>
  );
};

export default ServerWakeNotice;
