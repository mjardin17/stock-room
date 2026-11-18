import { Boxes, Send } from 'lucide-react';

export type AppScreen = 'stock-room' | 'send-to-sell';

interface NavbarProps {
  activeScreen: AppScreen;
  onSelectScreen: (screen: AppScreen) => void;
  readyCount: number;
}

export function Navbar({
  activeScreen,
  onSelectScreen,
  readyCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-400">
            <Boxes className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="truncate font-display text-base font-bold tracking-tight text-slate-100">
            Stock Room
          </span>
        </div>

        <nav
          aria-label="Primary screens"
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 p-1"
        >
          <button
            type="button"
            onClick={() => onSelectScreen('stock-room')}
            aria-current={activeScreen === 'stock-room' ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              activeScreen === 'stock-room'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <Boxes className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Stock Room</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScreen('send-to-sell')}
            aria-current={activeScreen === 'send-to-sell' ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              activeScreen === 'send-to-sell'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <Send className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Send to sell</span>
            <span
              className={`ml-0.5 font-mono text-[11px] tabular-nums ${
                activeScreen === 'send-to-sell'
                  ? 'text-slate-950/80'
                  : 'text-amber-400'
              }`}
            >
              {readyCount}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
