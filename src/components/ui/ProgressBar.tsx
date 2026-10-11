interface Props {
  /** 0-100 */
  value: number;
  /** optional darker inner value 0-100 */
  secondary?: number;
  trackClass?: string;
  barClass?: string;
  height?: string;
}

export function ProgressBar({ value, secondary, trackClass = 'bg-ink-900/10', barClass = 'bg-kanji-400', height = 'h-3' }: Props) {
  return (
    <div className={`relative w-full overflow-hidden rounded-full ${height} ${trackClass}`}>
      <div className={`absolute inset-y-0 left-0 rounded-full opacity-60 transition-all duration-700 ease-out ${barClass}`} style={{ width: `${value}%` }} />
      {secondary !== undefined && (
        <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${barClass}`} style={{ width: `${secondary}%` }} />
      )}
      {secondary === undefined && (
        <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${barClass}`} style={{ width: `${value}%` }} />
      )}
    </div>
  );
}
