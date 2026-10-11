import type { Entry } from '../types';
import { isGrammar } from '../types';

export interface Theme {
  label: string;
  /** full class strings so Tailwind's JIT sees them */
  chip: string;
  solid: string;
  soft: string;
  text: string;
  border: string;
  gradient: string;
}

export const KANJI_THEME: Theme = {
  label: 'Kanji',
  chip: 'bg-kanji-100 text-kanji-600',
  solid: 'bg-kanji-500',
  soft: 'bg-kanji-50',
  text: 'text-kanji-600',
  border: 'border-kanji-200',
  gradient: 'from-kanji-500 to-vocab-500',
};
export const VOCAB_THEME: Theme = {
  label: 'Vocabulary',
  chip: 'bg-vocab-100 text-vocab-600',
  solid: 'bg-vocab-500',
  soft: 'bg-vocab-50',
  text: 'text-vocab-600',
  border: 'border-vocab-200',
  gradient: 'from-vocab-400 to-vocab-600',
};
export const GRAMMAR_THEME: Theme = {
  label: 'Grammar',
  chip: 'bg-grammar-100 text-grammar-600',
  solid: 'bg-grammar-500',
  soft: 'bg-grammar-50',
  text: 'text-grammar-600',
  border: 'border-grammar-200',
  gradient: 'from-grammar-500 to-grammar-slate',
};

export function themeFor(e: Entry): Theme {
  if (isGrammar(e)) return GRAMMAR_THEME;
  return e.type === 'kanji' ? KANJI_THEME : VOCAB_THEME;
}
