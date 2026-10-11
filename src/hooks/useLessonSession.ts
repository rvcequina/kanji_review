import { useCallback, useState } from 'react';
import type { Entry } from '../types';

export const LESSON_BATCH_SIZE = 5;

export interface LessonSession {
  batch: Entry[];
  index: number;
  current: Entry | undefined;
  isLast: boolean;
  done: boolean;
  next: () => void;
  back: () => void;
}

/** Steps through a fixed batch of entries; `onComplete` fires once after the last "Next". */
export function useLessonSession(batch: Entry[], onComplete: (ids: string[]) => void): LessonSession {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const next = useCallback(() => {
    if (index >= batch.length - 1) {
      if (!done) {
        setDone(true);
        onComplete(batch.map((e) => e.id));
      }
      return;
    }
    setIndex((i) => i + 1);
  }, [index, batch, done, onComplete]);

  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  return { batch, index, current: batch[index], isLast: index === batch.length - 1, done, next, back };
}
