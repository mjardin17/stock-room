import { CheckCircle2, CircleAlert, Archive, Eye, PackageCheck, Globe } from 'lucide-react';
import type { StageSummary, StockStage } from '../types';

interface StagePipelineProps {
  stages: StageSummary[];
  selectedStage: StockStage | 'All';
  onSelectStage: (stage: StockStage | 'All') => void;
  totalItems: number;
}

const STAGE_ICONS: Record<StockStage, typeof CircleAlert> = {
  Intake: CircleAlert,
  'Needs review': Eye,
  Ready: PackageCheck,
  Listed: Globe,
  Sold: CheckCircle2,
  Archived: Archive,
};

export function StagePipeline({
  stages,
  selectedStage,
  onSelectStage,
  totalItems,
}: StagePipelineProps) {
  const readyAndBeyondCount = stages
    .filter((s) => s.stage === 'Ready' || s.stage === 'Listed' || s.stage === 'Sold')
    .reduce((sum, s) => sum + s.itemCount, 0);

  const activeNonArchivedCount = stages
    .filter((s) => s.stage !== 'Archived')
    .reduce((sum, s) => sum + s.itemCount, 0);

  const progressPct =
    activeNonArchivedCount > 0
      ? Math.round((readyAndBeyondCount / activeNonArchivedCount) * 100)
      : 0;

  return (
    <section
      aria-label="Inventory stage pipeline"
      className="rounded-xl border border-slate-800 bg-slate-900 p-4 studio-panel-glow"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Workflow pipeline
          </span>
          <div className="mt-0.5 flex items-baseline gap-2.5">
            <h2 className="text-sm font-bold text-slate-100">
              Six stages from intake to archive
            </h2>
            <span className="font-mono text-xs tabular-nums text-amber-400">
              {progressPct}% ready or live
            </span>
          </div>
        </div>

        {selectedStage !== 'All' && (
          <button
            type="button"
            onClick={() => onSelectStage('All')}
            className="whitespace-nowrap rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-amber-400/50 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Show all ({totalItems})
          </button>
        )}
      </div>

      {/* Continuous pipeline progress track */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-950">
        <div
          className="h-full rounded-full bg-amber-400 transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Connected stage nodes */}
      <div className="relative grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {stages.map((stageInfo, index) => {
          const isSelected = selectedStage === stageInfo.stage;
          const Icon = STAGE_ICONS[stageInfo.stage];
          const isIntakeAlert = stageInfo.stage === 'Intake' && stageInfo.itemCount > 0;
          const isDone = stageInfo.stage === 'Listed' || stageInfo.stage === 'Sold';

          return (
            <div key={stageInfo.stage} className="relative flex">
              {/* Connector stem on desktop between nodes */}
              {index < stages.length - 1 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 -right-2.5 hidden h-px w-2.5 -translate-y-1/2 bg-slate-700 lg:block"
                />
              )}

              <button
                type="button"
                onClick={() =>
                  onSelectStage(isSelected ? 'All' : stageInfo.stage)
                }
                aria-pressed={isSelected}
                className={`group flex w-full flex-col justify-between rounded-xl border p-3 text-left transition-[transform,border-color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isSelected
                    ? 'border-amber-400/60 bg-slate-950/90 studio-active-panel'
                    : 'border-slate-800 bg-slate-950/50 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    0{index + 1}
                  </span>
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isSelected
                        ? 'text-amber-400'
                        : isIntakeAlert
                          ? 'text-amber-400/80'
                          : isDone
                            ? 'text-emerald-400'
                            : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-100">
                    {stageInfo.label}
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                    {stageInfo.description}
                  </div>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between gap-2 border-t border-slate-800/80 pt-2 font-mono text-[11px] tabular-nums">
                  <span
                    className={
                      isSelected ? 'font-semibold text-amber-400' : 'text-slate-200'
                    }
                  >
                    {stageInfo.itemCount} {stageInfo.itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-slate-400">
                    {stageInfo.unitCount} {stageInfo.unitCount === 1 ? 'unit' : 'units'}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
