import { useRef, type ChangeEvent } from 'react';
import {
  Archive,
  Camera,
  Check,
  ImageOff,
  Pencil,
  RotateCcw,
  Undo2,
} from 'lucide-react';
import type { StockItem } from '../types';

interface StockItemCardProps {
  item: StockItem;
  busy: boolean;
  onUploadPhoto: (sku: string, file: File) => void;
  onEdit: (item: StockItem) => void;
  onApprove: (sku: string) => void;
  onSendBack: (sku: string) => void;
  onPutAway: (sku: string) => void;
  onBringBack: (sku: string) => void;
}

export function StockItemCard({
  item,
  busy,
  onUploadPhoto,
  onEdit,
  onApprove,
  onSendBack,
  onPutAway,
  onBringBack,
}: StockItemCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onUploadPhoto(item.sku, file);
    }
    event.target.value = '';
  }

  const canModifyPhoto =
    item.stage === 'Intake' ||
    item.stage === 'Needs review' ||
    item.stage === 'Ready';

  const canEdit =
    item.stage === 'Intake' ||
    item.stage === 'Needs review' ||
    item.stage === 'Ready' ||
    item.stage === 'Listed';

  const canPutAway =
    item.stage === 'Intake' ||
    item.stage === 'Needs review' ||
    item.stage === 'Ready' ||
    item.stage === 'Sold';

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-slate-700">
      <div>
        <div className="flex gap-3.5">
          {/* Thumbnail or No photo placeholder */}
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-center text-slate-500">
                <ImageOff className="h-4 w-4 text-slate-600" aria-hidden="true" />
                <span className="font-mono text-[10px] leading-tight">
                  No photo
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-100">
                  {item.title}
                </h3>
                <p className="mt-0.5 font-mono text-xs text-slate-400">
                  {item.sku}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {item.digital && (
                  <span className="rounded-full border border-indigo-300/30 bg-indigo-950/60 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
                    Digital
                  </span>
                )}
                <span className="rounded-full border border-indigo-300/25 bg-indigo-950/50 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
                  {item.stage}
                </span>
              </div>
            </div>

            {item.stage === 'Intake' && item.missing.length > 0 && (
              <p className="mt-2 text-xs font-medium text-amber-400">
                Needs {item.missing.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Metadata grid with tiny uppercase font-mono labels */}
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-slate-800/80 pt-3">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Quantity
            </dt>
            <dd className="mt-0.5 text-xs font-medium text-slate-200 tabular-nums">
              {item.digital ? 'digital, never runs out' : `${item.quantity} on hand`}
            </dd>
          </div>

          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Price
            </dt>
            <dd
              className={`mt-0.5 font-mono text-xs tabular-nums ${
                item.price !== null
                  ? 'font-semibold text-slate-100'
                  : 'text-slate-500'
              }`}
            >
              {item.price !== null ? `$${item.price.toFixed(2)}` : 'No price'}
            </dd>
          </div>

          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Condition
            </dt>
            <dd className="mt-0.5 text-xs text-slate-200">{item.condition}</dd>
          </div>

          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Kept at
            </dt>
            <dd className="mt-0.5 truncate text-xs text-slate-200">
              {item.location}
            </dd>
          </div>
        </dl>
      </div>

      {/* Stage-specific action buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3">
        {canModifyPhoto && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label={`Upload photo for ${item.title}`}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Camera className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>{item.image_url ? 'Change photo' : 'Add photo'}</span>
            </button>
          </>
        )}

        {canEdit && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>Edit</span>
          </button>
        )}

        {item.stage === 'Needs review' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onApprove(item.sku)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Approve</span>
          </button>
        )}

        {item.stage === 'Ready' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSendBack(item.sku)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Undo2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>Send back</span>
          </button>
        )}

        {canPutAway && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onPutAway(item.sku)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Put away</span>
          </button>
        )}

        {item.stage === 'Archived' && item.canBringBack && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onBringBack(item.sku)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/20 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Bring back</span>
          </button>
        )}
      </div>
    </article>
  );
}
