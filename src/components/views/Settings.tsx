import { useState } from 'react';
import { HOUR_MS, DAY_MS, formatDuration } from '../../lib/srs';
import { useSRS } from '../../hooks/useSRS';

const JUMPS: { label: string; ms: number }[] = [
  { label: '+1 hour', ms: HOUR_MS },
  { label: '+4 hours', ms: 4 * HOUR_MS },
  { label: '+1 day', ms: DAY_MS },
  { label: '+1 week', ms: 7 * DAY_MS },
  { label: '+1 month', ms: 30 * DAY_MS },
];

export function Settings() {
  const { timeOffsetMs, now, dueEntries, advanceTime, resetTime, resetAll } = useSRS();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="mx-auto max-w-2xl animate-fadeIn space-y-6">
      <h1 className="text-3xl font-extrabold">Settings</h1>

      <section className="card space-y-4 p-6">
        <div>
          <h2 className="text-lg font-bold">⏩ Mock Time Forward</h2>
          <p className="text-sm text-ink-700/70">Fast-forward the SRS clock to test upcoming reviews instantly.</p>
        </div>
        <div className="rounded-xl bg-vocab-50 p-4 text-sm">
          <div>App time: <b>{new Date(now).toLocaleString()}</b></div>
          <div>Offset: <b>{timeOffsetMs === 0 ? 'none' : `+${formatDuration(timeOffsetMs)}`}</b> · Due now: <b>{dueEntries.length}</b></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {JUMPS.map((j) => (
            <button key={j.label} onClick={() => advanceTime(j.ms)} className="btn !px-4 !py-2 bg-vocab-500 text-white hover:bg-vocab-600">{j.label}</button>
          ))}
          <button onClick={resetTime} disabled={timeOffsetMs === 0} className="btn !px-4 !py-2 bg-ink-900/10 text-ink-900">Reset clock</button>
        </div>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="text-lg font-bold text-red-600">Danger zone</h2>
        <p className="text-sm text-ink-700/70">Erase all lessons, SRS progress and mock time stored in this browser.</p>
        {confirming ? (
          <div className="flex gap-2">
            <button onClick={() => { resetAll(); setConfirming(false); }} className="btn bg-red-600 text-white">Yes, erase everything</button>
            <button onClick={() => setConfirming(false)} className="btn bg-ink-900/10">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="btn bg-red-50 text-red-600 ring-1 ring-red-200">Reset local data</button>
        )}
      </section>
    </div>
  );
}
