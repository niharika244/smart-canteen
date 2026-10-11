import { useEffect, useState } from 'react';

// Returns the current time (ms) and refreshes it on an interval, so "x min left" stays accurate.
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
