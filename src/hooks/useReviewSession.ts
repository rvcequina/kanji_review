import { useCallback, useMemo, useState } from 'react';
import type { Entry, JLPTGrammar, ReviewQuestion } from '../types';
import { isGrammar } from '../types';
import { checkGrammar, checkMeaning, checkReading } from '../lib/answer';
import type { Check } from '../lib/answer';

export const REVIEW_BATCH_SIZE = 25;

export type Phase = 'asking' | 'correct' | 'incorrect';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

function buildQueue(entries: Entry[]): ReviewQuestion[] {
  const qs: ReviewQuestion[] = [];
  for (const e of entries) {
    if (isGrammar(e)) {
      const reviewIndex = Math.floor(Math.random() * e.reviews.length);
      qs.push({ key: `${e.id}:g`, itemId: e.id, kind: 'grammar', reviewIndex });
    } else {
      qs.push({ key: `${e.id}:m`, itemId: e.id, kind: 'meaning', reviewIndex: 0 });
      qs.push({ key: `${e.id}:r`, itemId: e.id, kind: 'reading', reviewIndex: 0 });
    }
  }
  return shuffle(qs);
}

export interface ReviewSession {
  total: number;
  completed: number;
  current: ReviewQuestion | undefined;
  currentEntry: Entry | undefined;
  phase: Phase;
  warning: string | null;
  finished: boolean;
  accuracy: number;
  submit: (input: string) => void;
  next: () => void;
}

/**
 * WaniKani/Bunpro-style review engine.
 * - Vocab/kanji: a meaning and a reading question per item; wrong ones are re-queued.
 * - Grammar: a single cloze question per item.
 * An item is "complete" once all its questions are answered correctly; its mistake
 * count then drives the SRS level change via `onItemComplete`.
 */
export function useReviewSession(
  entries: Entry[],
  byId: ReadonlyMap<string, Entry>,
  onItemComplete: (itemId: string, mistakes: number) => void,
): ReviewSession {
  const total = entries.length;
  const [queue, setQueue] = useState<ReviewQuestion[]>(() => buildQueue(entries));
  const [remaining, setRemaining] = useState<Record<string, number>>(() => {
    const r: Record<string, number> = {};
    for (const q of buildQueue(entries)) r[q.itemId] = (r[q.itemId] ?? 0) + 1;
    return r;
  });
  const [mistakes, setMistakes] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(0);
  const [phase, setPhase] = useState<Phase>('asking');
  const [warning, setWarning] = useState<string | null>(null);
  const [answers, setAnswers] = useState({ right: 0, all: 0 });

  const current = queue[0];
  const currentEntry = current ? byId.get(current.itemId) : undefined;

  const evaluate = useCallback((q: ReviewQuestion, entry: Entry, input: string): Check => {
    if (q.kind === 'grammar' && isGrammar(entry)) {
      const review = (entry as JLPTGrammar).reviews[q.reviewIndex];
      return review ? checkGrammar(input, review.correctKana) : { verdict: 'incorrect' };
    }
    if (isGrammar(entry)) return { verdict: 'incorrect' };
    return q.kind === 'meaning' ? checkMeaning(input, entry.meanings) : checkReading(input, entry.reading);
  }, []);

  const submit = useCallback((input: string) => {
    if (phase !== 'asking' || !current || !currentEntry) return;
    const result = evaluate(current, currentEntry, input);
    if (result.verdict === 'invalid') { setWarning(result.message ?? 'Check your answer.'); return; }
    setWarning(null);
    const ok = result.verdict === 'correct';
    setAnswers((a) => ({ right: a.right + (ok ? 1 : 0), all: a.all + 1 }));
    if (!ok) setMistakes((m) => ({ ...m, [current.itemId]: (m[current.itemId] ?? 0) + 1 }));
    setPhase(ok ? 'correct' : 'incorrect');
  }, [phase, current, currentEntry, evaluate]);

  const next = useCallback(() => {
    if (!current || phase === 'asking') return;
    setWarning(null);
    if (phase === 'correct') {
      const left = (remaining[current.itemId] ?? 1) - 1;
      setRemaining((r) => ({ ...r, [current.itemId]: left }));
      if (left <= 0) {
        onItemComplete(current.itemId, mistakes[current.itemId] ?? 0);
        setCompleted((c) => c + 1);
      }
      setQueue((q) => q.slice(1));
    } else {
      // re-queue the missed question a few positions later (or at the end)
      setQueue((q) => {
        const [head, ...rest] = q;
        if (!head) return q;
        const at = Math.min(rest.length, 3);
        return [...rest.slice(0, at), head, ...rest.slice(at)];
      });
    }
    setPhase('asking');
  }, [current, phase, remaining, mistakes, onItemComplete]);

  const accuracy = useMemo(() => (answers.all === 0 ? 100 : Math.round((answers.right / answers.all) * 100)), [answers]);

  return { total, completed, current, currentEntry, phase, warning, finished: queue.length === 0, accuracy, submit, next };
}
