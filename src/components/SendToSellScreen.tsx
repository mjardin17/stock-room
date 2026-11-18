import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Film,
  ImageOff,
  Info,
  Radio,
  Send,
  Share2,
  ShoppingBag,
  Store,
} from 'lucide-react';
import * as stockApi from '../api/stockApi';
import type {
  Destination,
  DestinationIconKey,
  PreviewSendResult,
  SendRule,
  StockItem,
} from '../types';

type SendMode = 'hand' | 'rule';

interface SendToSellScreenProps {
  readyItems: StockItem[];
  onInventoryChanged: () => Promise<void>;
}

const DESTINATION_ICONS: Record<DestinationIconKey, typeof Store> = {
  ebay: ShoppingBag,
  store: Store,
  whatnot: Radio,
  facebook: Share2,
  instagram: Film,
};

export function SendToSellScreen({
  readyItems,
  onInventoryChanged,
}: SendToSellScreenProps) {
  const [mode, setMode] = useState<SendMode>('hand');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [handDestinationIds, setHandDestinationIds] = useState<string[]>([
    'ebay',
    'my-store',
  ]);
  const [rule, setRule] = useState<SendRule>({
    enabled: false,
    destinationIds: [],
  });
  const [confirmText, setConfirmText] = useState('');
  const [previewResult, setPreviewResult] = useState<PreviewSendResult | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(
    'Pick Ready items on the left and choose where they should go.',
  );
  const [statusKind, setStatusKind] = useState<'info' | 'success' | 'error'>(
    'info',
  );

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [destList, savedRule] = await Promise.all([
          stockApi.listDestinations(),
          stockApi.getRule(),
        ]);
        if (!active) return;
        setDestinations(destList);
        setRule(savedRule);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  // Keep selectedSkus synced with existing Ready items
  useEffect(() => {
    const readySkuSet = new Set(readyItems.map((i) => i.sku));
    setSelectedSkus((prev) => prev.filter((sku) => readySkuSet.has(sku)));
  }, [readyItems]);

  const activeDestinationIds =
    mode === 'hand' ? handDestinationIds : rule.destinationIds;

  const activeDestinations = useMemo(
    () =>
      destinations.filter(
        (d) => d.connected && activeDestinationIds.includes(d.id),
      ),
    [destinations, activeDestinationIds],
  );

  const selectedItems = useMemo(
    () => readyItems.filter((item) => selectedSkus.includes(item.sku)),
    [readyItems, selectedSkus],
  );

  const allSelected =
    readyItems.length > 0 && selectedItems.length === readyItems.length;

  function toggleSelectAll() {
    setPreviewResult(null);
    if (allSelected) {
      setSelectedSkus([]);
    } else {
      setSelectedSkus(readyItems.map((item) => item.sku));
    }
  }

  function toggleItem(sku: string) {
    setPreviewResult(null);
    setSelectedSkus((prev) =>
      prev.includes(sku) ? prev.filter((id) => id !== sku) : [...prev, sku],
    );
  }

  async function toggleDestination(dest: Destination) {
    if (!dest.connected) return;
    setPreviewResult(null);

    if (mode === 'hand') {
      setHandDestinationIds((prev) =>
        prev.includes(dest.id)
          ? prev.filter((id) => id !== dest.id)
          : [...prev, dest.id],
      );
      return;
    }

    const nextIds = rule.destinationIds.includes(dest.id)
      ? rule.destinationIds.filter((id) => id !== dest.id)
      : [...rule.destinationIds, dest.id];

    const nextRule: SendRule = {
      ...rule,
      destinationIds: nextIds,
    };

    setBusy(true);
    try {
      const saved = await stockApi.saveRule(nextRule);
      setRule(saved.rule);
      setStatusMessage(saved.message);
      setStatusKind('success');
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Could not update rule.',
      );
      setStatusKind('error');
    } finally {
      setBusy(false);
    }
  }

  async function toggleRuleEnabled() {
    setPreviewResult(null);
    const nextRule: SendRule = {
      ...rule,
      enabled: !rule.enabled,
    };
    setBusy(true);
    try {
      const saved = await stockApi.saveRule(nextRule);
      setRule(saved.rule);
      setStatusMessage(saved.message);
      setStatusKind(saved.rule.enabled ? 'success' : 'info');
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Could not save rule.',
      );
      setStatusKind('error');
    } finally {
      setBusy(false);
    }
  }

  async function handlePreview() {
    setBusy(true);
    try {
      const result = await stockApi.previewSend(
        selectedItems.map((i) => i.sku),
        activeDestinations.map((d) => d.id),
      );
      setPreviewResult(result);
      setStatusMessage(result.summary);
      setStatusKind('info');
    } catch (err) {
      setPreviewResult(null);
      setStatusMessage(
        err instanceof Error ? err.message : 'Could not build preview.',
      );
      setStatusKind('error');
    } finally {
      setBusy(false);
    }
  }

  async function handleSendLive() {
    setBusy(true);
    try {
      const result = await stockApi.sendLive(
        selectedItems.map((i) => i.sku),
        activeDestinations.map((d) => d.id),
        confirmText,
      );
      setConfirmText('');
      setPreviewResult(null);
      setSelectedSkus([]);
      await onInventoryChanged();
      setStatusMessage(result.message);
      setStatusKind('success');
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Could not send items live.',
      );
      setStatusKind('error');
    } finally {
      setBusy(false);
    }
  }

  const ruleDestinationNames = destinations
    .filter((d) => d.connected && rule.destinationIds.includes(d.id))
    .map((d) => d.name);

  const ruleSentence =
    ruleDestinationNames.length > 0
      ? `Every approved item goes to ${ruleDestinationNames.join(', ')}.`
      : 'No destinations selected yet — pick one or more tiles above.';

  const canPreview =
    !busy && selectedItems.length > 0 && activeDestinations.length > 0;
  const canSendLive = canPreview && confirmText.trim() === 'SEND_LIVE';

  return (
    <div className="space-y-5">
      {/* Header & Mode Switch */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center studio-panel-glow">
        <div>
          <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Channel dispatch
          </span>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-100">
            Send to sell
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Decide where each Ready item goes next. Prototype mode only — nothing posts externally.
          </p>
        </div>

        {/* Segmented control */}
        <div
          role="group"
          aria-label="Destination selection mode"
          className="inline-flex self-start rounded-xl border border-slate-800 bg-slate-950 p-1 sm:self-auto"
        >
          <button
            type="button"
            onClick={() => {
              setMode('hand');
              setPreviewResult(null);
            }}
            aria-pressed={mode === 'hand'}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              mode === 'hand'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-300 hover:text-slate-100'
            }`}
          >
            Pick by hand
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('rule');
              setPreviewResult(null);
            }}
            aria-pressed={mode === 'rule'}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              mode === 'rule'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-300 hover:text-slate-100'
            }`}
          >
            Automatic rule
          </button>
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

      {/* Main two-column workspace */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Ready items list */}
        <section
          aria-label="Ready items"
          className="rounded-xl border border-slate-800 bg-slate-900 p-4 lg:col-span-6"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Approved stock
              </span>
              <h2 className="text-sm font-bold text-slate-100">
                Ready items ({readyItems.length})
              </h2>
            </div>

            {readyItems.length > 0 && (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 accent-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                />
                <span>Select all</span>
              </label>
            )}
          </div>

          {readyItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-200">
                No Ready items waiting
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Approve items in Stock Room under Needs review to queue them here.
              </p>
            </div>
          ) : (
            <div className="max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
              {readyItems.map((item) => {
                const checked = selectedSkus.includes(item.sku);
                return (
                  <label
                    key={item.sku}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-[transform,border-color,background-color] duration-150 hover:-translate-y-0.5 ${
                      checked
                        ? 'border-amber-400/50 bg-slate-950 studio-active-panel'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem(item.sku)}
                      className="h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-900 accent-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    />

                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-600">
                          <ImageOff className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-slate-100">
                          {item.title}
                        </span>
                        <span className="font-mono text-xs font-semibold tabular-nums text-amber-400">
                          {item.price !== null
                            ? `$${item.price.toFixed(2)}`
                            : 'No price'}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400">
                        <span className="font-mono">{item.sku}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {item.digital
                            ? 'digital, never runs out'
                            : `${item.quantity} on hand`}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.condition}</span>
                        {item.digital && (
                          <span className="rounded-full border border-indigo-300/30 bg-indigo-950/60 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                            Digital
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Destinations panel */}
        <section
          aria-label="Destinations"
          className={`rounded-xl border bg-slate-900 p-4 lg:col-span-6 ${
            mode === 'rule'
              ? 'border-amber-400/40 studio-active-panel'
              : 'border-slate-800'
          }`}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                {mode === 'hand' ? 'Manual target' : 'Rule builder'}
              </span>
              <h2 className="text-sm font-bold text-slate-100">Destinations</h2>
            </div>

            {mode === 'rule' && (
              <button
                type="button"
                role="switch"
                aria-checked={rule.enabled}
                disabled={busy}
                onClick={() => void toggleRuleEnabled()}
                className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  rule.enabled
                    ? 'border-emerald-400/40 bg-emerald-950/40 text-emerald-300'
                    : 'border-slate-700 bg-slate-950 text-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    rule.enabled ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                />
                <span>{rule.enabled ? 'Rule ON' : 'Rule OFF'}</span>
              </button>
            )}
          </div>

          {mode === 'rule' && (
            <div className="mb-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Plain-language rule
              </span>
              <p className="mt-1 text-xs text-slate-200">
                {ruleSentence}{' '}
                <span className="font-semibold text-amber-400">
                  {rule.enabled
                    ? 'Automatic rule is ON.'
                    : 'Automatic rule is OFF.'}
                </span>
              </p>
            </div>
          )}

          {loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-16 animate-pulse rounded-xl border border-slate-800 bg-slate-950/60"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {destinations.map((dest) => {
                const Icon = DESTINATION_ICONS[dest.iconKey];
                const isSelected =
                  dest.connected && activeDestinationIds.includes(dest.id);

                return (
                  <button
                    key={dest.id}
                    type="button"
                    disabled={!dest.connected || busy}
                    aria-pressed={isSelected}
                    onClick={() => void toggleDestination(dest)}
                    className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-[transform,border-color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      !dest.connected
                        ? 'cursor-not-allowed border-slate-800/80 bg-slate-950/40 opacity-60'
                        : isSelected
                          ? 'border-amber-400/60 bg-slate-950 studio-active-panel hover:-translate-y-0.5'
                          : 'border-slate-800 bg-slate-950/60 hover:-translate-y-0.5 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                            isSelected
                              ? 'border-amber-400/40 bg-amber-400/15 text-amber-400'
                              : 'border-slate-800 bg-slate-900 text-slate-400'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                        <span className="text-xs font-bold text-slate-100">
                          {dest.name}
                        </span>
                      </div>

                      <span
                        title={
                          dest.connected ? 'Connected' : 'Not connected yet'
                        }
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            dest.connected ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>
                          {dest.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </span>
                    </div>

                    <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400">
                      {dest.note}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Review before sending tray */}
      <section
        aria-label="Review before sending"
        className="rounded-xl border border-slate-800 bg-slate-900 p-4 studio-panel-glow"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Preflight check
            </span>
            <h2 className="text-sm font-bold text-slate-100">
              Review before sending
            </h2>
          </div>

          <span className="font-mono text-xs tabular-nums text-slate-400">
            {selectedItems.length} selected · {activeDestinations.length}{' '}
            {activeDestinations.length === 1 ? 'destination' : 'destinations'}
          </span>
        </div>

        {/* Selected item chips list */}
        <div className="mt-3">
          {selectedItems.length === 0 ? (
            <p className="text-xs text-slate-400">
              Select at least one Ready item on the left to prepare your send queue.
            </p>
          ) : (
            <ul className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950/60">
              {selectedItems.map((item) => (
                <li
                  key={item.sku}
                  className="flex flex-col justify-between gap-2 px-3.5 py-2.5 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-100">
                      {item.title}
                    </span>
                    <span className="ml-2 font-mono text-[11px] text-slate-400">
                      {item.sku}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeDestinations.length === 0 ? (
                      <span className="text-xs text-rose-400">
                        No connected destination chosen
                      </span>
                    ) : (
                      activeDestinations.map((dest) => (
                        <span
                          key={dest.id}
                          className="rounded-full border border-indigo-300/30 bg-indigo-950/60 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300"
                        >
                          {dest.name}
                        </span>
                      ))
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Preview output when triggered */}
        {previewResult && (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-slate-950 p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
                Dry-run preview
              </span>
              <span className="text-xs text-slate-400">
                {previewResult.summary}
              </span>
            </div>

            <div className="space-y-3">
              {previewResult.plans.map((plan) => (
                <div
                  key={plan.sku}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100">
                      {plan.title}{' '}
                      <span className="font-mono font-normal text-slate-400">
                        ({plan.sku})
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {plan.quantityLabel}
                    </span>
                  </div>

                  <ul className="mt-2 space-y-1">
                    {plan.actions.map((action) => (
                      <li
                        key={action.destinationId}
                        className="text-xs text-slate-300"
                      >
                        <strong className="text-indigo-300">
                          {action.destinationName}:
                        </strong>{' '}
                        {action.actionSummary}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action controls */}
        <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-end">
          <button
            type="button"
            disabled={!canPreview}
            onClick={() => void handlePreview()}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>Preview (sends nothing)</span>
          </button>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div>
              <label
                htmlFor="confirm-send-live"
                className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                Type SEND_LIVE to unlock
              </label>
              <input
                id="confirm-send-live"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="SEND_LIVE"
                autoComplete="off"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 placeholder:text-slate-600 sm:w-40 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
              />
            </div>

            <button
              type="button"
              disabled={!canSendLive}
              onClick={() => void handleSendLive()}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Send live</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
