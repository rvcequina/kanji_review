import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T>(
  key: string,
  initial: T,
  sanitize: (value: unknown) => T | null,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        const clean = sanitize(parsed);
        if (clean !== null) return clean;
      }
    } catch {
      /* corrupted or unavailable storage → fall back to initial */
    }
    return initial;
  });

  const keyRef = useRef(key);
  keyRef.current = key;
  useEffect(() => {
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      /* quota / private mode: ignore */
    }
  }, [value]);

  const set: Dispatch<SetStateAction<T>> = useCallback((v) => setValue(v), []);
  return [value, set];
}
