import raw from '../data/db.json';
import type { Database, Entry, JLPTLevel } from '../types';

export const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

// db.json is trusted mock data; cast through unknown to the strict schema.
const db = raw as unknown as Database;

const rank = (l: JLPTLevel): number => LEVELS.indexOf(l);

/** All study entries ordered N5 → N1 (kanji, vocab, then grammar within a level). */
export const ALL_ENTRIES: Entry[] = [...db.items, ...db.grammar].sort((a, b) => {
  const byLevel = rank(a.level) - rank(b.level);
  if (byLevel !== 0) return byLevel;
  const order = (e: Entry): number => ('pattern' in e ? 2 : e.type === 'kanji' ? 0 : 1);
  return order(a) - order(b);
});

export const ENTRY_BY_ID: ReadonlyMap<string, Entry> = new Map(ALL_ENTRIES.map((e) => [e.id, e]));
