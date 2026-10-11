import { isAllKana, katakanaToHiragana, romajiToKana } from './romaji';

export type Verdict = 'correct' | 'incorrect' | 'invalid';

export interface Check {
  verdict: Verdict;
  /** Shown when verdict === 'invalid' (does not count as a mistake). */
  message?: string;
}

function levenshtein(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0] ?? 0;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j] ?? 0;
      dp[j] = Math.min(tmp + 1, (dp[j - 1] ?? 0) + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length] ?? 0;
}

function normalizeMeaning(s: string): string {
  return s.toLowerCase().replace(/[.,!?'"()]/g, '').replace(/\s+/g, ' ').trim().replace(/^(to|a|an|the) /, '');
}

export function checkMeaning(input: string, meanings: string[]): Check {
  const guess = normalizeMeaning(input);
  if (!guess) return { verdict: 'invalid', message: 'Type an answer first.' };
  if (!/[a-z0-9]/.test(guess)) return { verdict: 'invalid', message: "We're looking for the meaning in English." };
  const ok = meanings.some((m) => {
    const target = normalizeMeaning(m);
    if (guess === target) return true;
    // forgive a small typo on longer words
    return target.length >= 5 && levenshtein(guess, target) <= (target.length >= 9 ? 2 : 1);
  });
  return { verdict: ok ? 'correct' : 'incorrect' };
}

const normKana = (s: string): string => katakanaToHiragana(s.normalize('NFKC')).replace(/[\s、。・〜~]/g, '');

export function checkReading(rawInput: string, reading: string): Check {
  const kana = normKana(romajiToKana(rawInput.trim(), true));
  if (!kana) return { verdict: 'invalid', message: 'Type an answer first.' };
  if (!isAllKana(kana)) return { verdict: 'invalid', message: "We're looking for the reading in kana (or romaji)." };
  const accepted = reading.split(/[、,/]/).map((r) => normKana(r.trim())).filter(Boolean);
  return { verdict: accepted.includes(kana) ? 'correct' : 'incorrect' };
}

export function checkGrammar(rawInput: string, correctKana: string): Check {
  const typed = rawInput.trim();
  if (!typed) return { verdict: 'invalid', message: 'Fill in the blank first.' };
  const converted = normKana(romajiToKana(typed, true));
  const accepted = correctKana.split('|').map((a) => normKana(a));
  const ok = accepted.includes(converted) || accepted.includes(normKana(typed));
  return { verdict: ok ? 'correct' : 'incorrect' };
}

/** Primary (first) accepted grammar answer, for display. */
export function primaryAnswer(correctKana: string): string {
  return correctKana.split('|')[0] ?? correctKana;
}
