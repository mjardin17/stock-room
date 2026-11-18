import { useEffect, useState, type FormEvent } from 'react';
import { Lock, X } from 'lucide-react';
import type { ItemCondition, StockItem, UpdateItemInput } from '../types';

const CONDITIONS: ItemCondition[] = [
  'New',
  'New with tags',
  'New in box',
  'Like new',
  'Used',
  'For parts',
];

interface EditItemModalProps {
  item: StockItem | null;
  busy: boolean;
  onClose: () => void;
  onSave: (sku: string, fields: UpdateItemInput) => Promise<void>;
}

export function EditItemModal({
  item,
  busy,
  onClose,
  onSave,
}: EditItemModalProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState<ItemCondition>('New');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setPrice(item.price !== null ? String(item.price) : '');
    setQuantity(String(item.quantity));
    setCondition(item.condition);
    setLocation(item.location);
    setError(null);
  }, [item]);

  useEffect(() => {
    if (!item) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const isListed = item.stage === 'Listed';
  const isReady = item.stage === 'Ready';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;
    setError(null);

    if (!title.trim()) {
      setError('Item name cannot be empty.');
      return;
    }
    if (!location.trim()) {
      setError('Where it is kept cannot be empty.');
      return;
    }

    const trimmedPrice = price.trim();
    const parsedPrice =
      trimmedPrice === '' ? null : Number.parseFloat(trimmedPrice);
    if (
      parsedPrice !== null &&
      (Number.isNaN(parsedPrice) || parsedPrice <= 0)
    ) {
      setError('Price must be greater than zero, or blank if unset.');
      return;
    }

    const parsedQuantity = Math.max(0, Math.floor(Number(quantity) || 0));

    try {
      await onSave(item.sku, {
        title: title.trim(),
        price: parsedPrice,
        quantity: isListed || item.digital ? item.quantity : parsedQuantity,
        condition,
        location: location.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl studio-active-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Edit {item.sku}
            </span>
            <h2
              id="edit-modal-title"
              className="mt-0.5 text-base font-bold text-slate-100"
            >
              Update item details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit dialog"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {isReady && (
          <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
            Changing name, price, condition, or quantity will send this Ready item back to Needs review.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label
              htmlFor="edit-title"
              className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
            >
              Name
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="edit-price"
                className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                Price ($)
              </label>
              <input
                id="edit-price"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="No price"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs tabular-nums text-slate-100 placeholder:text-slate-600 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
              />
            </div>

            <div>
              <label
                htmlFor="edit-quantity"
                className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                <span>How many</span>
                {isListed && (
                  <Lock className="h-3 w-3 text-slate-500" aria-hidden="true" />
                )}
              </label>
              {item.digital ? (
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-400">
                  digital, never runs out
                </div>
              ) : (
                <input
                  id="edit-quantity"
                  type="number"
                  min={0}
                  step={1}
                  disabled={isListed}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs tabular-nums text-slate-100 disabled:cursor-not-allowed disabled:bg-slate-950/50 disabled:text-slate-500 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
                />
              )}
              {isListed && !item.digital && (
                <p className="mt-1 text-[11px] text-slate-400">
                  kept by the automatic sync
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-condition"
                className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                Condition
              </label>
              <select
                id="edit-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-slate-100 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-location"
                className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                Where it is kept
              </label>
              <input
                id="edit-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
              />
            </div>
          </div>

          {error && <p className="text-xs font-medium text-rose-400">{error}</p>}

          <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
