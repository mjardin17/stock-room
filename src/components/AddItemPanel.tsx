import { useState, type FormEvent } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import type { AddItemInput, ItemCondition } from '../types';

const CONDITIONS: ItemCondition[] = [
  'New',
  'New with tags',
  'New in box',
  'Like new',
  'Used',
  'For parts',
];

interface AddItemPanelProps {
  onAdd: (input: AddItemInput) => Promise<void>;
  busy: boolean;
}

export function AddItemPanel({ onAdd, busy }: AddItemPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState<ItemCondition>('New');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Enter an item name before adding.');
      return;
    }
    if (!location.trim()) {
      setError('Enter where it is kept (shelf, bin, or box).');
      return;
    }

    const parsedQty = Math.max(1, Math.floor(Number(quantity) || 1));
    const trimmedPrice = price.trim();
    const parsedPrice =
      trimmedPrice === '' ? null : Number.parseFloat(trimmedPrice);

    if (
      parsedPrice !== null &&
      (Number.isNaN(parsedPrice) || parsedPrice <= 0)
    ) {
      setError('Price must be greater than zero, or leave it blank for later.');
      return;
    }

    try {
      await onAdd({
        title: title.trim(),
        quantity: parsedQty,
        condition,
        location: location.trim(),
        price: parsedPrice,
      });
      setTitle('');
      setQuantity('1');
      setCondition('New');
      setLocation('');
      setPrice('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add item.');
    }
  }

  return (
    <section
      aria-label="Add item"
      className="rounded-xl border border-slate-800 bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Quick intake
          </span>
          <h2 className="text-sm font-bold text-slate-100">Add item</h2>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <span>{expanded ? 'Hide form' : 'Open form'}</span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {expanded && (
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-800 px-4 py-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <label
                htmlFor="add-item-name"
                className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                Item name
              </label>
              <input
                id="add-item-name"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brass Desk Magnifier"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
              />
            </div>

            <div className="lg:col-span-1">
              <label
                htmlFor="add-item-qty"
                className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                How many
              </label>
              <input
                id="add-item-qty"
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs tabular-nums text-slate-100 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
              />
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="add-item-condition"
                className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                Condition
              </label>
              <select
                id="add-item-condition"
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

            <div className="lg:col-span-3">
              <label
                htmlFor="add-item-location"
                className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                Where it is kept
              </label>
              <input
                id="add-item-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Shelf B-2, Bin 4, Box 1"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
              />
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="add-item-price"
                className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400"
              >
                Your price (optional)
              </label>
              <input
                id="add-item-price"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Set later"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs tabular-nums text-slate-100 placeholder:text-slate-600 focus-visible:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              {error ? (
                <span className="font-medium text-rose-400">{error}</span>
              ) : (
                <span>
                  New items start in <strong className="text-slate-200">Intake</strong> until a photo and price are attached.
                </span>
              )}
            </p>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add item</span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
