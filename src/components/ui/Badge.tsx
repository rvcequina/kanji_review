import type { Entry } from '../../types';
import { themeFor } from '../../lib/theme';
import { stageLabel, STAGE_COLOR, getStage } from '../../lib/srs';

export function TypeBadge({ entry }: { entry: Entry }) {
  const t = themeFor(entry);
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.chip}`}>{t.label}</span>;
}

export function LevelBadge({ level }: { level: string }) {
  return <span className="rounded-full bg-ink-900/10 px-2.5 py-0.5 text-xs font-bold text-ink-700">{level}</span>;
}

export function StageBadge({ level }: { level: number }) {
  const color = STAGE_COLOR[getStage(level)];
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: color }}>
      {stageLabel(level)}
    </span>
  );
}
