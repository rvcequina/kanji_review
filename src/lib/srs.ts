import type { SRSProgress, SRSStage } from '../types';

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 8;
export const HOUR_MS = 3_600_000;
export const DAY_MS = 24 * HOUR_MS;
/** ISO date used for burned items so they never come due. */
export const NEVER_ISO = '9999-12-31T00:00:00.000Z';

/** Wait (hours) before the next review once an item reaches the given level. */
const INTERVAL_HOURS: Record<number, number> = { 1: 4, 2: 8, 3: 24, 4: 48, 5: 168, 6: 336, 7: 720 };

export const STAGES: { stage: SRSStage; label: string; from: number; to: number }[] = [
  { stage: 'apprentice', label: 'Apprentice', from: 1, to: 2 },
  { stage: 'guru', label: 'Guru', from: 3, to: 4 },
  { stage: 'master', label: 'Master', from: 5, to: 5 },
  { stage: 'enlightened', label: 'Enlightened', from: 6, to: 7 },
  { stage: 'burned', label: 'Burned', from: 8, to: 8 },
];

export const STAGE_COLOR: Record<SRSStage, string> = {
  apprentice: '#ff5fa2',
  guru: '#9b5de5',
  master: '#4d7cff',
  enlightened: '#00b4d8',
  burned: '#5b6475',
};

export function getStage(level: number): SRSStage {
  return STAGES.find((s) => level >= s.from && level <= s.to)?.stage ?? 'apprentice';
}

export function stageLabel(level: number): string {
  return STAGES.find((s) => level >= s.from && level <= s.to)?.label ?? 'Apprentice';
}

export function dueDateFor(level: number, nowMs: number): string {
  const hours = INTERVAL_HOURS[level];
  return hours === undefined ? NEVER_ISO : new Date(nowMs + hours * HOUR_MS).toISOString();
}

export function newProgress(itemId: string, nowMs: number): SRSProgress {
  return { itemId, srsLevel: 1, nextReviewDate: dueDateFor(1, nowMs) };
}

/**
 * Apply the result of a finished review.
 * - no mistakes → +1 level
 * - mistakes → drop 1 level (2 if 2+ mistakes or the item was Master+), never below 1
 */
export function applyReview(p: SRSProgress, mistakes: number, nowMs: number): SRSProgress {
  let level: number;
  if (mistakes === 0) level = Math.min(MAX_LEVEL, p.srsLevel + 1);
  else {
    const penalty = mistakes >= 2 || p.srsLevel >= 5 ? 2 : 1;
    level = Math.max(MIN_LEVEL, p.srsLevel - penalty);
  }
  return { ...p, srsLevel: level, nextReviewDate: dueDateFor(level, nowMs) };
}

export function isDue(p: SRSProgress, nowMs: number): boolean {
  return p.srsLevel < MAX_LEVEL && new Date(p.nextReviewDate).getTime() <= nowMs;
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return 'now';
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${Math.max(1, m)}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}
