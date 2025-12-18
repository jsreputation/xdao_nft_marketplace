'use client';

import { useEffect, useRef } from 'react';

export function usePolling(callback: () => void, interval: number = 10000) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      callbackRef.current();
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval]);
}

