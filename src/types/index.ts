export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

/** Kanji & Vocabulary (WaniKani style). */
export interface JLPTItem {
  id: string;
  level: JLPTLevel;
  type: 'kanji' | 'vocabulary';
  /** e.g. "食べる" or "日" */
  item: string;
  /** Kana reading. Multiple accepted readings are separated by "、" (e.g. "にち、ひ"). */
  reading: string;
  meanings: string[];
  /** Radicals / building blocks */
  components?: string[];
  mnemonic: string;
  examples: { ja: string; furigana: string; en: string }[];
}

export interface GrammarReview {
  /** Full sentence; the blank is marked with "＿＿＿＿＿". */
  sentenceJa: string;
  /** Hint shown under the sentence (word to conjugate / which form is expected). */
  blankIndex: string;
  /** Accepted answer(s) in kana; alternatives separated by "|" (e.g. "つかってもいい|使ってもいい"). */
  correctKana: string;
  translationEn: string;
}

/** Grammar points (Bunpro style). */
export interface JLPTGrammar {
  id: string;
  level: JLPTLevel;
  /** e.g. "〜てもいい" */
  pattern: string;
  meaning: string;
  formation: string;
  notes: string;
  reviews: GrammarReview[];
}

/** User progress / SRS tracker. */
export interface SRSProgress {
  itemId: string;
  /** 1-8 (Apprentice → Burned) */
  srsLevel: number;
  /** ISO string */
  nextReviewDate: string;
}

export type Entry = JLPTItem | JLPTGrammar;

export interface Database {
  items: JLPTItem[];
  grammar: JLPTGrammar[];
}

export type SRSStage = 'apprentice' | 'guru' | 'master' | 'enlightened' | 'burned';

export type QuestionKind = 'meaning' | 'reading' | 'grammar';

export interface ReviewQuestion {
  key: string;
  itemId: string;
  kind: QuestionKind;
  /** index into JLPTGrammar.reviews for grammar questions */
  reviewIndex: number;
}

export interface PersistedState {
  progress: Record<string, SRSProgress>;
  /** Mock-time offset added to Date.now() */
  timeOffsetMs: number;
}

export type View = 'dashboard' | 'browser' | 'settings';

export function isGrammar(entry: Entry): entry is JLPTGrammar {
  return 'pattern' in entry;
}
