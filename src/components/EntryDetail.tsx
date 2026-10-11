import type { Entry } from '../types';
import { isGrammar } from '../types';
import { themeFor } from '../lib/theme';
import { LevelBadge, TypeBadge } from './ui/Badge';

/** Shared "info card": used by lessons, the level browser and the review drawer. */
export function EntryDetail({ entry, compact = false }: { entry: Entry; compact?: boolean }) {
  const theme = themeFor(entry);

  if (isGrammar(entry)) {
    return (
      <div className="space-y-4">
        <div className={`rounded-2xl bg-gradient-to-br ${theme.gradient} p-6 text-white ${compact ? '' : 'text-center'}`}>
          <div className="mb-2 flex items-center gap-2"><LevelBadge level={entry.level} /><TypeBadge entry={entry} /></div>
          <div className={`font-jp font-bold ${compact ? 'text-3xl' : 'text-5xl'}`}>{entry.pattern}</div>
          <div className="mt-2 text-lg font-medium text-white/90">{entry.meaning}</div>
        </div>
        <Section title="Formation" tone={theme.soft}><code className="font-jp text-base font-semibold">{entry.formation}</code></Section>
        <Section title="Notes" tone={theme.soft}>{entry.notes}</Section>
        {entry.reviews[0] && (
          <Section title="Example" tone={theme.soft}>
            <div className="font-jp text-base">{entry.reviews[0].sentenceJa.replace(/＿+/, entry.reviews[0].correctKana.split('|')[0] ?? '')}</div>
            <div className="text-sm text-ink-700/70">{entry.reviews[0].translationEn}</div>
          </Section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl bg-gradient-to-br ${theme.gradient} p-6 text-white ${compact ? 'flex items-center gap-5' : 'text-center'}`}>
        <div className={compact ? '' : 'mb-2 flex justify-center gap-2'}>
          {!compact && (<><LevelBadge level={entry.level} /><TypeBadge entry={entry} /></>)}
        </div>
        <div className={`font-jp font-bold leading-tight ${compact ? 'text-5xl' : 'text-7xl'}`}>{entry.item}</div>
        <div className={compact ? '' : 'mt-3'}>
          <div className="font-jp text-2xl font-medium">{entry.reading.replace(/、/g, '、 ')}</div>
          <div className="text-lg text-white/90">{entry.meanings.join(', ')}</div>
        </div>
      </div>
      {entry.components && entry.components.length > 0 && (
        <Section title="Components" tone={theme.soft}>
          <div className="flex flex-wrap gap-2">
            {entry.components.map((c) => (
              <span key={c} className={`rounded-lg px-3 py-1 font-jp text-xl ${theme.chip}`}>{c}</span>
            ))}
          </div>
        </Section>
      )}
      <Section title="Mnemonic" tone={theme.soft}>{entry.mnemonic}</Section>
      {entry.examples.length > 0 && (
        <Section title="Examples" tone={theme.soft}>
          {entry.examples.map((ex) => (
            <div key={ex.ja} className="mb-2 last:mb-0">
              <div className="font-jp text-lg">{ex.ja}</div>
              <div className="font-jp text-xs text-ink-700/60">{ex.furigana}</div>
              <div className="text-sm text-ink-700/80">{ex.en}</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, tone, children }: { title: string; tone: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-4 ${tone}`}>
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-700/60">{title}</div>
      <div className="leading-relaxed text-ink-900">{children}</div>
    </div>
  );
}
