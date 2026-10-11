import type { View } from '../types';

const NAV: { view: View; label: string; icon: string }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { view: 'browser', label: 'JLPT Levels', icon: '📚' },
  { view: 'settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar({ view, onChange, dueCount }: { view: View; onChange: (v: View) => void; dueCount: number }) {
  return (
    <>
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-ink-900 p-5 text-white md:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-kanji-400 to-vocab-500 font-jp text-xl font-bold">日</div>
          <div><div className="text-lg font-extrabold leading-none">Nihonggo</div><div className="text-xs text-white/50">JLPT Review</div></div>
        </div>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <button key={n.view} onClick={() => onChange(n.view)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition ${view === n.view ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
              <span>{n.icon}</span><span className="flex-1">{n.label}</span>
              {n.view === 'dashboard' && dueCount > 0 && <span className="rounded-full bg-kanji-500 px-2 text-xs font-bold">{dueCount}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto text-xs text-white/40">Mock data · saved in your browser</div>
      </aside>
      {/* mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex bg-ink-900 text-white md:hidden">
        {NAV.map((n) => (
          <button key={n.view} onClick={() => onChange(n.view)}
            className={`flex flex-1 flex-col items-center py-2.5 text-xs ${view === n.view ? 'text-white' : 'text-white/50'}`}>
            <span className="text-lg">{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
    </>
  );
}
