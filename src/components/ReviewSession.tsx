import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Entry } from '../types';
import { isGrammar } from '../types';
import { ENTRY_BY_ID } from '../lib/entries';
import { primaryAnswer } from '../lib/answer';
import { romajiToKana } from '../lib/romaji';
import { themeFor } from '../lib/theme';
import { useReviewSession } from '../hooks/useReviewSession';
import { useSRS } from '../hooks/useSRS';
import { EntryDetail } from './EntryDetail';
import { ProgressBar } from './ui/ProgressBar';

export function ReviewSession({ entries, onExit }: { entries: Entry[]; onExit: () => void }) {
  const { recordReview } = useSRS();
  const s = useReviewSession(entries, ENTRY_BY_ID, recordReview);
  const [value, setValue] = useState('');
  const [drawer, setDrawer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const entry = s.currentEntry;
  const q = s.current;
  const usesKana = q?.kind === 'reading' || q?.kind === 'grammar';

  useEffect(() => { inputRef.current?.focus(); }, [q?.key, s.phase]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onExit(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  if (s.finished || !entry || !q) {
    return (
      <Shell tint="bg-[#faf7fc]">
        <div className="m-auto max-w-md animate-pop space-y-5 text-center">
          <div className="text-6xl">✅</div>
          <h2 className="text-3xl font-extrabold">Session complete</h2>
          <p className="text-ink-700/70">{s.total} items reviewed · {s.accuracy}% accuracy</p>
          <button onClick={onExit} className="btn bg-ink-900 text-white">Back to dashboard</button>
        </div>
      </Shell>
    );
  }

  const theme = themeFor(entry);
  const grammar = isGrammar(entry) ? entry : null;
  const review = grammar?.reviews[q.reviewIndex];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (s.phase === 'asking') {
      s.submit(value);
    } else {
      s.next();
      setValue('');
      setDrawer(false);
    }
  };

  const onChange = (raw: string) => setValue(usesKana ? romajiToKana(raw, false) : raw);

  // Auto-open the info drawer on a wrong answer.
  const showDrawer = drawer || s.phase === 'incorrect';

  const answerText = review ? primaryAnswer(review.correctKana)
    : q.kind === 'meaning' && !grammar ? (entry as Exclude<Entry, { pattern: string }>).meanings.join(', ')
    : !grammar ? (entry as Exclude<Entry, { pattern: string }>).reading.replace(/、/g, '、 ') : '';

  const inputTone = s.phase === 'correct' ? 'bg-emerald-500 text-white' : s.phase === 'incorrect' ? 'bg-red-500 text-white animate-shake' : 'bg-white text-ink-900';
  const promptLabel = grammar ? 'Grammar · Fill in the blank' : `${theme.label} ${q.kind === 'meaning' ? 'Meaning' : 'Reading'}`;
  const placeholder = q.kind === 'meaning' ? 'Your answer (English)' : 'こたえ — type in romaji or kana';

  return (
    <Shell tint="bg-[#faf7fc]">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onExit} aria-label="Exit review" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm hover:bg-ink-900/5">✕</button>
          <div className="flex-1"><ProgressBar value={(s.completed / s.total) * 100} barClass={grammar ? 'bg-grammar-500' : 'bg-kanji-500'} /></div>
          <div className="text-sm font-semibold tabular-nums text-ink-700">{s.completed}/{s.total} · {s.accuracy}%</div>
        </div>

        <div key={q.key} className={`animate-slideUp overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} px-6 py-10 text-center text-white shadow-lg`}>
          {grammar && review ? (
            <>
              <div className="font-jp text-3xl font-bold leading-relaxed sm:text-4xl">
                {review.sentenceJa.split(/(＿+)/).map((part, i) =>
                  /^＿+$/.test(part)
                    ? <span key={i} className="mx-1 inline-block min-w-[5rem] border-b-4 border-white/80 px-2 align-bottom">{s.phase === 'asking' ? ' ' : <span className="text-yellow-200">{primaryAnswer(review.correctKana)}</span>}</span>
                    : <span key={i}>{part}</span>)}
              </div>
              <div className="mt-4 text-lg text-white/90">“{review.translationEn}”</div>
              <div className="mt-2 text-sm text-white/70">Hint: {review.blankIndex}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/60">{grammar.pattern}</div>
            </>
          ) : (
            <div className="font-jp text-7xl font-bold leading-tight sm:text-8xl">{!isGrammar(entry) ? entry.item : ''}</div>
          )}
        </div>

        <div className="text-center text-sm font-bold uppercase tracking-wider text-ink-700/60">{promptLabel}</div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input ref={inputRef} value={value} onChange={(e) => onChange(e.target.value)} readOnly={s.phase !== 'asking'}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder={placeholder} lang={usesKana ? 'ja' : 'en'}
            className={`w-full rounded-2xl px-5 py-4 text-center font-jp text-2xl font-semibold shadow-md outline-none ring-2 ring-transparent transition-colors focus:ring-ink-900/20 ${inputTone}`} />
          {s.warning && <div className="animate-fadeIn text-center text-sm font-medium text-amber-600">{s.warning}</div>}
          <div className="flex gap-3">
            <button type="submit" className={`btn flex-1 ${s.phase === 'asking' ? 'bg-ink-900 text-white' : s.phase === 'correct' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
              {s.phase === 'asking' ? 'Submit ⏎' : 'Next ⏎'}
            </button>
            {s.phase !== 'asking' && (
              <button type="button" onClick={() => setDrawer((d) => !d)} className="btn bg-white ring-1 ring-ink-900/10">{showDrawer ? 'Hide info' : 'Info'} ⓘ</button>
            )}
          </div>
        </form>

        {s.phase === 'incorrect' && (
          <div className="animate-fadeIn text-center">
            <span className="text-sm text-ink-700/70">Correct answer: </span>
            <span className="font-jp text-lg font-bold text-red-600">{answerText}</span>
          </div>
        )}

        {/* Info drop-down drawer */}
        <div className={`grid transition-all duration-300 ease-out ${showDrawer && s.phase !== 'asking' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden"><div className="pb-6"><EntryDetail entry={entry} compact /></div></div>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children, tint }: { children: React.ReactNode; tint: string }) {
  return <div className={`fixed inset-0 z-50 flex animate-fadeIn flex-col overflow-y-auto p-4 sm:p-8 ${tint}`}>{children}</div>;
}
