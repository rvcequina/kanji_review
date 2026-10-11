import { useState } from 'react';
import type { JLPTLevel } from '../../types';
import { isGrammar } from '../../types';
import { ALL_ENTRIES, LEVELS } from '../../lib/entries';
import { themeFor } from '../../lib/theme';
import { useSRS } from '../../hooks/useSRS';
import { EntryDetail } from '../EntryDetail';
import { StageBadge } from '../ui/Badge';

const GROUPS = [
  { key: 'kanji', title: 'Kanji' },
  { key: 'vocabulary', title: 'Vocabulary' },
  { key: 'grammar', title: 'Grammar' },
] as const;

export function LevelBrowser() {
  const { progress } = useSRS();
  const [level, setLevel] = useState<JLPTLevel>('N5');
  const [openId, setOpenId] = useState<string | null>(null);
  const entries = ALL_ENTRIES.filter((e) => e.level === level);
  const open = entries.find((e) => e.id === openId);

  return (
    <div className="mx-auto max-w-5xl animate-fadeIn space-y-6">
      <h1 className="text-3xl font-extrabold">JLPT Levels</h1>
      <div className="flex gap-2">
        {LEVELS.map((l) => (
          <button key={l} onClick={() => { setLevel(l); setOpenId(null); }}
            className={`rounded-xl px-5 py-2 font-bold transition ${l === level ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 ring-1 ring-ink-900/10 hover:bg-ink-900/5'}`}>{l}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {GROUPS.map((g) => {
            const list = entries.filter((e) => (g.key === 'grammar' ? isGrammar(e) : !isGrammar(e) && e.type === g.key));
            if (list.length === 0) return null;
            return (
              <section key={g.key}>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-700/60">{g.title} · {list.length}</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {list.map((e) => {
                    const t = themeFor(e);
                    const p = progress[e.id];
                    return (
                      <button key={e.id} onClick={() => setOpenId(e.id)}
                        className={`card p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${openId === e.id ? `ring-2 ${t.border}` : ''} ${p ? '' : 'opacity-70'}`}>
                        <div className={`inline-block rounded-lg px-2 py-1 font-jp text-xl font-bold text-white ${t.solid}`}>{isGrammar(e) ? e.pattern : e.item}</div>
                        <div className="mt-2 truncate text-xs text-ink-700/70">{isGrammar(e) ? e.meaning : e.meanings[0]}</div>
                        <div className="mt-1">{p ? <StageBadge level={p.srsLevel} /> : <span className="text-xs text-ink-700/40">Not started</span>}</div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start">
          {open ? <div key={open.id} className="animate-slideUp"><EntryDetail entry={open} compact /></div>
            : <div className="card p-6 text-center text-ink-700/50">Select an item to see its details</div>}
        </aside>
      </div>
    </div>
  );
}
