import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Entry, JLPTLevel, PersistedState, SRSProgress, SRSStage } from '../types';
import { ALL_ENTRIES, LEVELS } from '../lib/entries';
import { applyReview, getStage, isDue, newProgress } from '../lib/srs';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'nihonggo.jlpt.v1';
const EMPTY: PersistedState = { progress: {}, timeOffsetMs: 0 };

function sanitize(value: unknown): PersistedState | null {
  if (typeof value !== 'object' || value === null) return null;
  const rec = value as Record<string, unknown>;
  const progress: Record<string, SRSProgress> = {};
  if (typeof rec.progress === 'object' && rec.progress !== null) {
    for (const [id, p] of Object.entries(rec.progress as Record<string, unknown>)) {
      if (typeof p !== 'object' || p === null) continue;
      const r = p as Record<string, unknown>;
      if (typeof r.srsLevel === 'number' && typeof r.nextReviewDate === 'string') {
        progress[id] = { itemId: id, srsLevel: r.srsLevel, nextReviewDate: r.nextReviewDate };
      }
    }
  }
  const offset = typeof rec.timeOffsetMs === 'number' && Number.isFinite(rec.timeOffsetMs) ? rec.timeOffsetMs : 0;
  return { progress, timeOffsetMs: offset };
}

export interface LevelStats { total: number; learned: number; guruPlus: number }

export interface SRSStore {
  now: number;
  timeOffsetMs: number;
  progress: Record<string, SRSProgress>;
  dueEntries: Entry[];
  unlearned: Entry[];
  nextDueAt: number | null;
  stageCounts: Record<SRSStage, number>;
  levelStats: Record<JLPTLevel, LevelStats>;
  completeLesson: (ids: string[]) => void;
  recordReview: (itemId: string, mistakes: number) => void;
  advanceTime: (ms: number) => void;
  resetTime: () => void;
  resetAll: () => void;
}

export function useSRSStore(): SRSStore {
  const [state, setState] = useLocalStorage<PersistedState>(STORAGE_KEY, EMPTY, sanitize);
  const [tick, setTick] = useState(0);

  // Re-evaluate "due" every 20s so the dashboard stays live.
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 20_000);
    return () => window.clearInterval(t);
  }, []);

  const { progress, timeOffsetMs } = state;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => Date.now() + timeOffsetMs, [timeOffsetMs, tick, progress]);

  const dueEntries = useMemo(
    () => ALL_ENTRIES.filter((e) => {
      const p = progress[e.id];
      return p !== undefined && isDue(p, now);
    }),
    [progress, now],
  );

  const unlearned = useMemo(() => ALL_ENTRIES.filter((e) => progress[e.id] === undefined), [progress]);

  const nextDueAt = useMemo(() => {
    const upcoming = Object.values(progress)
      .filter((p) => p.srsLevel < 8 && new Date(p.nextReviewDate).getTime() > now)
      .map((p) => new Date(p.nextReviewDate).getTime());
    return upcoming.length ? Math.min(...upcoming) : null;
  }, [progress, now]);

  const stageCounts = useMemo(() => {
    const counts: Record<SRSStage, number> = { apprentice: 0, guru: 0, master: 0, enlightened: 0, burned: 0 };
    for (const p of Object.values(progress)) counts[getStage(p.srsLevel)] += 1;
    return counts;
  }, [progress]);

  const levelStats = useMemo(() => {
    const stats = Object.fromEntries(LEVELS.map((l) => [l, { total: 0, learned: 0, guruPlus: 0 }])) as Record<JLPTLevel, LevelStats>;
    for (const e of ALL_ENTRIES) {
      const s = stats[e.level];
      s.total += 1;
      const p = progress[e.id];
      if (p) {
        s.learned += 1;
        if (p.srsLevel >= 3) s.guruPlus += 1;
      }
    }
    return stats;
  }, [progress]);

  const completeLesson = useCallback((ids: string[]) => {
    setState((prev) => {
      const t = Date.now() + prev.timeOffsetMs;
      const next = { ...prev.progress };
      for (const id of ids) if (!next[id]) next[id] = newProgress(id, t);
      return { ...prev, progress: next };
    });
  }, [setState]);

  const recordReview = useCallback((itemId: string, mistakes: number) => {
    setState((prev) => {
      const current = prev.progress[itemId];
      if (!current) return prev;
      const t = Date.now() + prev.timeOffsetMs;
      return { ...prev, progress: { ...prev.progress, [itemId]: applyReview(current, mistakes, t) } };
    });
  }, [setState]);

  const advanceTime = useCallback((ms: number) => setState((p) => ({ ...p, timeOffsetMs: p.timeOffsetMs + ms })), [setState]);
  const resetTime = useCallback(() => setState((p) => ({ ...p, timeOffsetMs: 0 })), [setState]);
  const resetAll = useCallback(() => setState(EMPTY), [setState]);

  return {
    now, timeOffsetMs, progress, dueEntries, unlearned, nextDueAt, stageCounts, levelStats,
    completeLesson, recordReview, advanceTime, resetTime, resetAll,
  };
}
