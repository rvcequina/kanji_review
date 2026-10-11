import { LEVELS } from '../../lib/entries';
import { STAGES, STAGE_COLOR, formatDuration } from '../../lib/srs';
import { useSRS } from '../../hooks/useSRS';
import { ProgressBar } from '../ui/ProgressBar';
import { REVIEW_BATCH_SIZE } from '../../hooks/useReviewSession';

interface Props { onStartLessons: () => void; onStartReviews: () => void }

const LEVEL_BAR: Record<string, string> = {
  N5: 'bg-kanji-400', N4: 'bg-vocab-400', N3: 'bg-stage-master', N2: 'bg-stage-enlightened', N1: 'bg-grammar-500',
};

export function Dashboard({ onStartLessons, onStartReviews }: Props) {
  const { dueEntries, unlearned, stageCounts, levelStats, nextDueAt, now, advanceTime } = useSRS();
  const due = dueEntries.length;
  const totalLearned = Object.values(stageCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-5xl animate-fadeIn space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">Welcome back 👋</h1>
        <p className="text-ink-700/70">{totalLearned} items learned · {unlearned.length} waiting in your lesson queue</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <button onClick={onStartLessons} disabled={unlearned.length === 0}
          className="btn flex-col items-start !rounded-2xl bg-gradient-to-br from-kanji-500 to-vocab-500 !p-6 text-left text-white shadow-lg shadow-kanji-500/20 hover:-translate-y-0.5">
          <span className="text-sm font-medium text-white/80">New material</span>
          <span className="text-2xl font-extrabold">Start Lessons</span>
          <span className="text-sm text-white/80">{unlearned.length} available · 5 per batch</span>
        </button>
        <button onClick={onStartReviews} disabled={due === 0}
          className="btn flex-col items-start !rounded-2xl bg-gradient-to-br from-grammar-500 to-grammar-slate !p-6 text-left text-white shadow-lg shadow-grammar-500/20 hover:-translate-y-0.5">
          <span className="text-sm font-medium text-white/80">Spaced repetition</span>
          <span className="text-2xl font-extrabold">Review {due} Item{due === 1 ? '' : 's'}</span>
          <span className="text-sm text-white/80">
            {due > REVIEW_BATCH_SIZE ? `${REVIEW_BATCH_SIZE} per session` : due > 0 ? 'Ready now' : nextDueAt ? `Next in ${formatDuration(nextDueAt - now)}` : 'Learn something first'}
          </span>
        </button>
      </div>

      {due === 0 && nextDueAt !== null && (
        <button onClick={() => advanceTime(nextDueAt - now + 1000)} className="text-sm font-medium text-vocab-600 underline-offset-2 hover:underline">
          ⏩ Nothing due — skip ahead to the next review (mock time)
        </button>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">SRS stages</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STAGES.map((s) => (
            <div key={s.stage} className="card animate-slideUp p-4 text-center" style={{ borderTop: `4px solid ${STAGE_COLOR[s.stage]}` }}>
              <div className="text-3xl font-extrabold" style={{ color: STAGE_COLOR[s.stage] }}>{stageCounts[s.stage]}</div>
              <div className="text-sm font-medium text-ink-700/70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">JLPT progress</h2>
        <div className="card divide-y divide-ink-900/5">
          {LEVELS.map((lvl) => {
            const s = levelStats[lvl];
            const learnedPct = s.total ? (s.learned / s.total) * 100 : 0;
            const guruPct = s.total ? (s.guruPlus / s.total) * 100 : 0;
            return (
              <div key={lvl} className="flex items-center gap-4 p-4">
                <div className="w-12 text-xl font-extrabold">{lvl}</div>
                <div className="flex-1"><ProgressBar value={learnedPct} secondary={guruPct} barClass={LEVEL_BAR[lvl] ?? 'bg-kanji-400'} /></div>
                <div className="w-28 text-right text-sm text-ink-700/70">{s.learned}/{s.total} learned</div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-ink-700/50">Light bar = learned · solid bar = Guru or higher</p>
      </section>
    </div>
  );
}
