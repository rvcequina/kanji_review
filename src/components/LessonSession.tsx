import { useEffect } from 'react';
import type { Entry } from '../types';
import { isGrammar } from '../types';
import { useLessonSession } from '../hooks/useLessonSession';
import { useSRS } from '../hooks/useSRS';
import { EntryDetail } from './EntryDetail';
import { ProgressBar } from './ui/ProgressBar';

export function LessonSession({ batch, onExit }: { batch: Entry[]; onExit: () => void }) {
  const { completeLesson } = useSRS();
  const s = useLessonSession(batch, completeLesson);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') s.next();
      if (e.key === 'ArrowLeft') s.back();
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [s, onExit]);

  if (s.done) {
    return (
      <Overlay>
        <div className="mx-auto max-w-xl animate-pop space-y-6 text-center">
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-extrabold">Lessons complete!</h2>
          <p className="text-ink-700/70">{batch.length} items were added to your review queue. Your first review is in about 4 hours — use <b>Settings → Mock Time Forward</b> to test it now.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {batch.map((e) => <span key={e.id} className="rounded-lg bg-white px-3 py-1 font-jp text-lg shadow-sm">{isGrammar(e) ? e.pattern : e.item}</span>)}
          </div>
          <button onClick={onExit} className="btn bg-ink-900 text-white">Back to dashboard</button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5">
        <div className="flex items-center gap-4">
          <button onClick={onExit} aria-label="Close lessons" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm hover:bg-ink-900/5">✕</button>
          <div className="flex-1"><ProgressBar value={((s.index + 1) / batch.length) * 100} barClass="bg-vocab-500" /></div>
          <div className="text-sm font-semibold text-ink-700">{s.index + 1} / {batch.length}</div>
        </div>
        {s.current && <div key={s.current.id} className="animate-slideUp"><EntryDetail entry={s.current} /></div>}
        <div className="mt-auto flex gap-3 pb-2">
          <button onClick={s.back} disabled={s.index === 0} className="btn flex-1 bg-white ring-1 ring-ink-900/10">← Back</button>
          <button onClick={s.next} className="btn flex-[2] bg-ink-900 text-white">{s.isLast ? 'Finish lessons ✓' : 'Next →'}</button>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex animate-fadeIn flex-col overflow-y-auto bg-[#faf7fc] p-4 sm:p-8">{children}</div>;
}
