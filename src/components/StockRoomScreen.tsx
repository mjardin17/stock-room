import { useMemo, useState } from 'react';
import { CheckCircle2, Info, Search, AlertCircle } from 'lucide-react';
import * as stockApi from '../api/stockApi';
import type {
  AddItemInput,
  StageSummary,
  StockItem,
  StockStage,
  UpdateItemInput,
} from '../types';
import { AddItemPanel } from './AddItemPanel';
import { EditItemModal } from './EditItemModal';
import { StagePipeline } from './StagePipeline';
import { StockItemCard } from './StockItemCard';

interface StockRoomScreenProps {
  items: StockItem[];
  stages: StageSummary[];
  totalItems: number;
  totalUnits: number;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export function StockRoomScreen({
  items,
  stages,
  totalItems,
  totalUnits,
  loading,
  onRefresh,
}: StockRoomScreenProps) {
  const [selectedStage, setSelectedStage] = useState<StockStage | 'All'>('All');
  const [query, setQuery] = useState('');
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Ready. Click any pipeline stage to filter your stock.',
  );
  const [statusKind, setStatusKind] = useState<'info' | 'success' | 'error'>(
    'info',
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedStage !== 'All' && item.stage !== selectedStage) {
        return false;
      }
      if (!normalizedQuery) return true;
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.sku.toLowerCase().includes(normalizedQuery) ||
        item.location.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [items, selectedStage, query]);

  async function runAction(
    fn: () => Promise<{ message: string }>,
    kind: 'success' | 'info' = 'success',
  ) {
    setBusy(true);
    try {
      const result = await fn();
      await onRefresh();
      setStatusMessage(result.message);
      setStatusKind(kind);
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
      setStatusKind('error');
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd(input: AddItemInput) {
    setBusy(true);
    try {
      const result = await stockApi.addItem(input);
      await onRefresh();
      setStatusMessage(result.message);
      setStatusKind('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not add item.';
      setStatusMessage(msg);
      setStatusKind('error');
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveEdit(sku: string, fields: UpdateItemInput) {
    setBusy(true);
    try {
      const result = await stockApi.updateItem(sku, fields);
      await onRefresh();
      setStatusMessage(result.message);
      setStatusKind('success');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not save changes.';
      setStatusMessage(msg);
      setStatusKind('error');
      throw err;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Screen Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-end studio-panel-glow">
        <div>
          <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Inventory control
          </span>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-100">
            Stock Room
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Everything you physically have on shelves or in your digital vault, listed or not.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 border-t border-slate-800 pt-3 sm:border-t-0 sm:pt-0">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Total items
            </span>
            <span className="mt-0.5 block font-mono text-lg font-semibold tabular-nums text-slate-100">
              {totalItems}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800" aria-hidden="true" />

          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Units on hand
            </span>
            <span className="mt-0.5 block font-mono text-lg font-semibold tabular-nums text-amber-400">
              {totalUnits}
            </span>
          </div>
        </div>
      </div>

      {/* Polite status line */}
      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs ${
          statusKind === 'error'
            ? 'border-rose-400/30 bg-rose-950/30 text-rose-300'
            : statusKind === 'success'
              ? 'border-emerald-400/25 bg-emerald-950/20 text-emerald-300'
              : 'border-slate-800 bg-slate-900/70 text-slate-300'
        }`}
      >
        {statusKind === 'error' ? (
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" aria-hidden="true" />
        ) : statusKind === 'success' ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
        ) : (
          <Info className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
        )}
        <span>{statusMessage}</span>
      </div>

      {/* Six-stage horizontal pipeline */}
      <StagePipeline
        stages={stages}
        selectedStage={selectedStage}
        onSelectStage={setSelectedStage}
        totalItems={totalItems}
      />

      {/* Add item panel */}
      <AddItemPanel onAdd={handleAdd} busy={busy} />

      {/* Filter & item list header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-bold text-slate-100">
            {selectedStage === 'All' ? 'All stock' : selectedStage}
          </h2>
          <span className="font-mono text-xs tabular-nums text-slate-400">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, code, or bin"
            aria-label="Filter items by name, item code, or location"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1.5 pr-3 pl-8 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
          />
        </div>
      </div>

      {/* Item cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-52 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 px-4 py-10 text-center">
          <p className="text-sm font-semibold text-slate-200">
            No items match this view
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {selectedStage !== 'All'
              ? `There are no items in ${selectedStage} matching your filter.`
              : 'Add a new item above or clear the search box.'}
          </p>
          {(selectedStage !== 'All' || query.trim() !== '') && (
            <button
              type="button"
              onClick={() => {
                setSelectedStage('All');
                setQuery('');
              }}
              className="mt-3 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-amber-400/60 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <StockItemCard
              key={item.sku}
              item={item}
              busy={busy}
              onUploadPhoto={(sku, file) =>
                void runAction(() => stockApi.uploadPhoto(sku, file))
              }
              onEdit={setEditingItem}
              onApprove={(sku) => void runAction(() => stockApi.approve(sku))}
              onSendBack={(sku) =>
                void runAction(() => stockApi.sendBack(sku), 'info')
              }
              onPutAway={(sku) =>
                void runAction(() => stockApi.putAway(sku), 'info')
              }
              onBringBack={(sku) =>
                void runAction(() => stockApi.bringBack(sku))
              }
            />
          ))}
        </div>
      )}

      <EditItemModal
        item={editingItem}
        busy={busy}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
