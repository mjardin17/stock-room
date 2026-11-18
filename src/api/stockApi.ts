import pourOverImg from '../assets/images/product_pour_over_1794525296338.jpg';
import fieldRecorderImg from '../assets/images/product_field_recorder_1794525296412.jpg';
import deskLampImg from '../assets/images/product_desk_lamp_1794525296772.jpg';
import ceramicBowlImg from '../assets/images/product_ceramic_bowl_1794525295975.jpg';
import tapePackImg from '../assets/images/product_tape_pack_1794525297294.jpg';
import type {
  AddItemInput,
  Destination,
  PreviewItemPlan,
  PreviewSendResult,
  SendLiveResult,
  SendRule,
  StageSummary,
  StockItem,
  StockListResponse,
  StockMutationResult,
  StockStage,
  UpdateItemInput,
} from '../types';

const STAGE_ORDER: Array<{
  stage: StockStage;
  label: string;
  description: string;
}> = [
  {
    stage: 'Intake',
    label: 'Intake',
    description: 'Something is missing',
  },
  {
    stage: 'Needs review',
    label: 'Needs review',
    description: 'Complete, waiting for you',
  },
  {
    stage: 'Ready',
    label: 'Ready',
    description: 'Approved, not listed yet',
  },
  {
    stage: 'Listed',
    label: 'Listed',
    description: 'Live on a selling site',
  },
  {
    stage: 'Sold',
    label: 'Sold',
    description: 'None left',
  },
  {
    stage: 'Archived',
    label: 'Archived',
    description: 'Put away',
  },
];

function makeStudioGraphic(label: string, accentHex: string): string {
  const safeLabel = label.replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="240" height="240" fill="url(#bg)"/>
    <circle cx="120" cy="108" r="46" fill="none" stroke="${accentHex}" stroke-opacity="0.35" stroke-width="2"/>
    <rect x="88" y="76" width="64" height="64" rx="12" fill="#020617" fill-opacity="0.65" stroke="${accentHex}" stroke-opacity="0.7" stroke-width="1.5"/>
    <circle cx="120" cy="108" r="14" fill="${accentHex}" fill-opacity="0.22" stroke="${accentHex}" stroke-width="1.5"/>
    <text x="120" y="186" text-anchor="middle" fill="#cbd5e1" font-family="ui-monospace, SFMono-Regular, monospace" font-size="13" letter-spacing="1.5">${safeLabel.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function computeMissing(item: Pick<StockItem, 'price' | 'image_url'>): string[] {
  const missing: string[] = [];
  if (item.price === null || Number.isNaN(item.price) || item.price <= 0) {
    missing.push('your price');
  }
  if (!item.image_url) {
    missing.push('a photo');
  }
  return missing;
}

const initialStock: StockItem[] = [
  {
    sku: 'SR-1041',
    title: 'Brushed Brass Catchall Tray',
    price: null,
    quantity: 2,
    condition: 'Like new',
    location: 'Shelf A-2',
    image_url: null,
    stage: 'Intake',
    missing: ['your price', 'a photo'],
    digital: false,
    canBringBack: false,
  },
  {
    sku: 'SR-1042',
    title: 'Waxed Canvas Tool Roll',
    price: 34,
    quantity: 4,
    condition: 'New with tags',
    location: 'Bin C-4',
    image_url: null,
    stage: 'Intake',
    missing: ['a photo'],
    digital: false,
    canBringBack: false,
  },
  {
    sku: 'SR-1043',
    title: 'Speckled Stoneware Matcha Set',
    price: null,
    quantity: 1,
    condition: 'New in box',
    location: 'Shelf B-1',
    image_url: ceramicBowlImg,
    stage: 'Intake',
    missing: ['your price'],
    digital: false,
    canBringBack: false,
  },
  {
    sku: 'SR-1035',
    title: 'Amber Glass Pour-Over Carafe',
    price: 48,
    quantity: 3,
    condition: 'New in box',
    location: 'Shelf A-1',
    image_url: pourOverImg,
    stage: 'Needs review',
    missing: [],
    digital: false,
    canBringBack: false,
  },
  {
    sku: 'SR-1036',
    title: 'Cast Iron Espresso Tamper',
    price: 29,
    quantity: 5,
    condition: 'New',
    location: 'Bin A-3',
    image_url: makeStudioGraphic('Tamper', '#38bdf8'),
    stage: 'Needs review',
    missing: [],
    digital: false,
    canBringBack: false,
  },
  {
    sku: 'SR-1037',
    title: 'Merino Wool Desk Pad',
    price: 42,
    quantity: 2,
    condition: 'New with tags',
    location: 'Shelf C-2',
    image_url: makeStudioGraphic('Desk Pad', '#a78bfa'),
    stage: 'Needs review',
    missing: [],
    digital: false,
    canBringBack: false,
  },
  {
    sku: 'SR-1028',
    title: 'Handheld Field Audio Recorder',
    price: 165,
    quantity: 1,
    condition: 'Like new',
    location: 'Cabinet D-1',
    image_url: fieldRecorderImg,
    stage: 'Ready',
    missing: [],
    digital: false,
    canBringBack: false,
  },
  {
    sku: 'SR-1029',
    title: 'Articulated Bronze Task Lamp',
    price: 118,
    quantity: 2,
    condition: 'New in box',
    location: 'Shelf D-4',
    image_url: deskLampImg,
    stage: 'Ready',
    missing: [],
    digital: false,
    canBringBack: false,
  },
  {
    sku: 'SR-1030',
    title: 'Warm Tape Loop Audio Pack',
    price: 18,
    quantity: 1,
    condition: 'New',
    location: 'Digital vault',
    image_url: tapePackImg,
    stage: 'Ready',
    missing: [],
    digital: true,
    canBringBack: false,
  },
  {
    sku: 'SR-1019',
    title: 'Anodized Aluminum Pen Stand',
    price: 26,
    quantity: 6,
    condition: 'New',
    location: 'Bin B-2',
    image_url: makeStudioGraphic('Pen Stand', '#fbbf24'),
    stage: 'Listed',
    missing: [],
    digital: false,
    canBringBack: false,
  },
  {
    sku: 'SR-1020',
    title: 'Printable Packing Slip Kit',
    price: 12,
    quantity: 1,
    condition: 'New',
    location: 'Digital vault',
    image_url: makeStudioGraphic('Digital Kit', '#34d399'),
    stage: 'Listed',
    missing: [],
    digital: true,
    canBringBack: false,
  },
  {
    sku: 'SR-1011',
    title: 'Copper Stovetop Kettle',
    price: 64,
    quantity: 0,
    condition: 'Used',
    location: 'Packed bay 2',
    image_url: makeStudioGraphic('Kettle', '#fb7185'),
    stage: 'Sold',
    missing: [],
    digital: false,
    canBringBack: false,
  },
  {
    sku: 'SR-1004',
    title: 'Mechanical Kitchen Timer',
    price: 15,
    quantity: 2,
    condition: 'For parts',
    location: 'Box Z-9',
    image_url: makeStudioGraphic('Timer', '#94a3b8'),
    stage: 'Archived',
    missing: [],
    digital: false,
    canBringBack: true,
  },
  {
    sku: 'SR-1001',
    title: 'Linen Bound Inventory Ledger',
    price: 22,
    quantity: 0,
    condition: 'New',
    location: 'Archive box 1',
    image_url: makeStudioGraphic('Ledger', '#64748b'),
    stage: 'Archived',
    missing: [],
    digital: false,
    canBringBack: false,
  },
];

const initialDestinations: Destination[] = [
  {
    id: 'ebay',
    name: 'eBay',
    connected: true,
    note: 'Connected · Fixed-price listing & SKU sync ready',
    iconKey: 'ebay',
  },
  {
    id: 'my-store',
    name: 'My store',
    connected: true,
    note: 'Connected · Direct catalog storefront active',
    iconKey: 'store',
  },
  {
    id: 'whatnot',
    name: 'Whatnot',
    connected: false,
    note: 'Not connected yet · Seller token not linked in settings',
    iconKey: 'whatnot',
  },
  {
    id: 'facebook-page',
    name: 'Facebook Page post',
    connected: true,
    note: 'Connected · Shop post & price card queued cleanly',
    iconKey: 'facebook',
  },
  {
    id: 'instagram-reel',
    name: 'Instagram Reel',
    connected: true,
    note: 'Connected · Product tag & reel caption draft ready',
    iconKey: 'instagram',
  },
];

let stockStore: StockItem[] = initialStock.map((item) => ({
  ...item,
  missing: [...item.missing],
}));

let nextSkuNumber = 1044;

let sendRuleStore: SendRule = {
  enabled: false,
  destinationIds: ['ebay', 'my-store'],
};

function cloneItem(item: StockItem): StockItem {
  return {
    ...item,
    missing: [...item.missing],
  };
}

function buildStageSummaries(items: StockItem[]): StageSummary[] {
  return STAGE_ORDER.map(({ stage, label, description }) => {
    const stageItems = items.filter((item) => item.stage === stage);
    const unitCount = stageItems.reduce(
      (sum, item) => sum + (item.digital ? 0 : item.quantity),
      0,
    );
    return {
      stage,
      label,
      description,
      itemCount: stageItems.length,
      unitCount,
    };
  });
}

function delay(ms = 40): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findItemOrThrow(sku: string): StockItem {
  const idx = stockStore.findIndex((item) => item.sku === sku);
  if (idx === -1) {
    throw new Error(`Item ${sku} was not found in the stock room.`);
  }
  return stockStore[idx];
}

function replaceItem(updated: StockItem): void {
  const idx = stockStore.findIndex((item) => item.sku === updated.sku);
  if (idx !== -1) {
    stockStore[idx] = updated;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read selected image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.readAsDataURL(file);
  });
}

export async function listStock(): Promise<StockListResponse> {
  await delay();
  const items = stockStore.map(cloneItem);
  const stages = buildStageSummaries(items);
  const totalItems = items.length;
  const totalUnits = items.reduce(
    (sum, item) => sum + (item.digital ? 0 : item.quantity),
    0,
  );

  return {
    items,
    stages,
    totalItems,
    totalUnits,
  };
}

export async function addItem(input: AddItemInput): Promise<StockMutationResult> {
  await delay();
  const title = input.title.trim();
  const location = input.location.trim();
  const quantity = Math.max(1, Math.floor(Number(input.quantity) || 1));
  const price =
    input.price !== null && !Number.isNaN(Number(input.price)) && Number(input.price) > 0
      ? Number(Number(input.price).toFixed(2))
      : null;

  if (!title) {
    throw new Error('Please enter an item name.');
  }
  if (!location) {
    throw new Error('Please enter where the item is kept.');
  }

  const sku = `SR-${nextSkuNumber++}`;
  const draft: StockItem = {
    sku,
    title,
    price,
    quantity,
    condition: input.condition,
    location,
    image_url: null,
    stage: 'Intake',
    missing: [],
    digital: false,
    canBringBack: false,
  };

  draft.missing = computeMissing(draft);
  draft.stage = draft.missing.length > 0 ? 'Intake' : 'Needs review';

  stockStore = [draft, ...stockStore];

  return {
    item: cloneItem(draft),
    message: `Added ${draft.title} (${draft.sku}) to ${draft.stage}.`,
  };
}

export async function updateItem(
  sku: string,
  fields: UpdateItemInput,
): Promise<StockMutationResult> {
  await delay();
  const existing = findItemOrThrow(sku);

  const nextTitle =
    fields.title !== undefined ? fields.title.trim() : existing.title;
  if (!nextTitle) {
    throw new Error('Item name cannot be empty.');
  }

  const nextLocation =
    fields.location !== undefined ? fields.location.trim() : existing.location;
  if (!nextLocation) {
    throw new Error('Storage location cannot be empty.');
  }

  const nextPrice =
    fields.price === undefined
      ? existing.price
      : fields.price !== null &&
          !Number.isNaN(Number(fields.price)) &&
          Number(fields.price) > 0
        ? Number(Number(fields.price).toFixed(2))
        : null;

  const nextCondition = fields.condition ?? existing.condition;

  const nextQuantity =
    existing.stage === 'Listed' || existing.digital
      ? existing.quantity
      : fields.quantity !== undefined
        ? Math.max(0, Math.floor(Number(fields.quantity) || 0))
        : existing.quantity;

  const coreChanged =
    nextTitle !== existing.title ||
    nextPrice !== existing.price ||
    nextCondition !== existing.condition ||
    nextQuantity !== existing.quantity;

  const updated: StockItem = {
    ...existing,
    title: nextTitle,
    price: nextPrice,
    condition: nextCondition,
    location: nextLocation,
    quantity: nextQuantity,
  };

  updated.missing = computeMissing(updated);

  let statusNote = `Saved changes to ${updated.title}.`;

  if (existing.stage === 'Listed') {
    statusNote =
      fields.quantity !== undefined && fields.quantity !== existing.quantity
        ? `Saved ${updated.title}. Quantity remains kept by the automatic sync.`
        : `Saved changes to live listing ${updated.title}.`;
  } else if (!updated.digital && updated.quantity === 0 && existing.stage !== 'Archived') {
    updated.stage = 'Sold';
    statusNote = `Updated ${updated.title} to 0 units — moved to Sold.`;
  } else if (existing.stage === 'Ready') {
    if (updated.missing.length > 0) {
      updated.stage = 'Intake';
      statusNote = `Updated ${updated.title} — moved to Intake because ${updated.missing.join(', ')} is missing.`;
    } else if (coreChanged) {
      updated.stage = 'Needs review';
      statusNote = `Updated ${updated.title} — sent back to Needs review for another check.`;
    }
  } else if (existing.stage === 'Intake' && updated.missing.length === 0) {
    updated.stage = 'Needs review';
    statusNote = `Completed ${updated.title} — moved to Needs review.`;
  } else if (existing.stage === 'Needs review' && updated.missing.length > 0) {
    updated.stage = 'Intake';
    statusNote = `Updated ${updated.title} — moved to Intake (needs ${updated.missing.join(', ')}).`;
  }

  replaceItem(updated);

  return {
    item: cloneItem(updated),
    message: statusNote,
  };
}

export async function uploadPhoto(
  sku: string,
  file: File,
): Promise<StockMutationResult> {
  await delay();
  const existing = findItemOrThrow(sku);
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  const dataUrl = await readFileAsDataUrl(file);
  const updated: StockItem = {
    ...existing,
    image_url: dataUrl,
  };
  updated.missing = computeMissing(updated);

  let message = `Updated photo for ${updated.title}.`;
  if (existing.stage === 'Intake' && updated.missing.length === 0) {
    updated.stage = 'Needs review';
    message = `Added photo to ${updated.title} — moved to Needs review.`;
  } else if (existing.stage === 'Intake') {
    message = `Added photo to ${updated.title} — still needs ${updated.missing.join(', ')}.`;
  }

  replaceItem(updated);

  return {
    item: cloneItem(updated),
    message,
  };
}

export async function approve(sku: string): Promise<StockMutationResult> {
  await delay();
  const existing = findItemOrThrow(sku);
  if (existing.stage !== 'Needs review') {
    throw new Error(`${existing.title} must be in Needs review before approving.`);
  }
  const missing = computeMissing(existing);
  if (missing.length > 0) {
    throw new Error(
      `Cannot approve ${existing.title} yet — needs ${missing.join(', ')}.`,
    );
  }

  const updated: StockItem = {
    ...existing,
    stage: 'Ready',
    missing: [],
  };
  replaceItem(updated);

  return {
    item: cloneItem(updated),
    message: `Approved ${updated.title} — now Ready to send.`,
  };
}

export async function sendBack(sku: string): Promise<StockMutationResult> {
  await delay();
  const existing = findItemOrThrow(sku);
  if (existing.stage !== 'Ready') {
    throw new Error(`${existing.title} is not in Ready.`);
  }

  const updated: StockItem = {
    ...existing,
    stage: 'Needs review',
  };
  replaceItem(updated);

  return {
    item: cloneItem(updated),
    message: `Sent ${updated.title} back to Needs review.`,
  };
}

export async function putAway(sku: string): Promise<StockMutationResult> {
  await delay();
  const existing = findItemOrThrow(sku);
  if (existing.stage === 'Listed') {
    throw new Error('Live listings cannot be put away directly.');
  }

  const canBringBack =
    existing.stage !== 'Sold' && (existing.digital || existing.quantity > 0);

  const updated: StockItem = {
    ...existing,
    stage: 'Archived',
    canBringBack,
  };
  replaceItem(updated);

  return {
    item: cloneItem(updated),
    message: `Put ${updated.title} away in Archived.`,
  };
}

export async function bringBack(sku: string): Promise<StockMutationResult> {
  await delay();
  const existing = findItemOrThrow(sku);
  if (existing.stage !== 'Archived' || !existing.canBringBack) {
    throw new Error(`${existing.title} cannot be brought back from archive.`);
  }

  const missing = computeMissing(existing);
  const nextStage: StockStage = missing.length > 0 ? 'Intake' : 'Needs review';
  const updated: StockItem = {
    ...existing,
    stage: nextStage,
    missing,
    canBringBack: false,
  };
  replaceItem(updated);

  return {
    item: cloneItem(updated),
    message: `Brought ${updated.title} back to ${nextStage}.`,
  };
}

export async function listDestinations(): Promise<Destination[]> {
  await delay();
  return initialDestinations.map((dest) => ({ ...dest }));
}

export async function getRule(): Promise<SendRule> {
  await delay();
  return {
    enabled: sendRuleStore.enabled,
    destinationIds: [...sendRuleStore.destinationIds],
  };
}

export async function saveRule(rule: SendRule): Promise<{
  rule: SendRule;
  message: string;
}> {
  await delay();
  const validConnectedIds = new Set(
    initialDestinations.filter((d) => d.connected).map((d) => d.id),
  );
  const cleanedIds = rule.destinationIds.filter((id) => validConnectedIds.has(id));

  sendRuleStore = {
    enabled: Boolean(rule.enabled),
    destinationIds: cleanedIds,
  };

  const destNames = initialDestinations
    .filter((d) => cleanedIds.includes(d.id))
    .map((d) => d.name);

  const message = sendRuleStore.enabled
    ? destNames.length > 0
      ? `Automatic rule saved: approved items target ${destNames.join(', ')}.`
      : 'Automatic rule is on, with no destinations chosen yet.'
    : 'Automatic rule turned off.';

  return {
    rule: {
      enabled: sendRuleStore.enabled,
      destinationIds: [...sendRuleStore.destinationIds],
    },
    message,
  };
}

function buildDestinationSummary(
  item: StockItem,
  destination: Destination,
): string {
  const priceText = item.price !== null ? `$${item.price.toFixed(2)}` : 'No price';
  const stockText = item.digital
    ? 'digital, never runs out'
    : `${item.quantity} unit${item.quantity === 1 ? '' : 's'} tracked`;

  switch (destination.id) {
    case 'ebay':
      return `Create fixed-price listing at ${priceText} (${item.condition}, ${stockText}) under SKU ${item.sku}.`;
    case 'my-store':
      return `Publish product card "${item.title}" at ${priceText} with ${stockText} from ${item.location}.`;
    case 'facebook-page':
      return `Draft Page shop post with cover photo, ${priceText} tag, and ${item.condition.toLowerCase()} note.`;
    case 'instagram-reel':
      return `Prepare Reel product tag "${item.title}" (${priceText}) linked to catalog SKU ${item.sku}.`;
    default:
      return `Queue "${item.title}" at ${priceText}.`;
  }
}

export async function previewSend(
  skus: string[],
  destinationIds: string[],
): Promise<PreviewSendResult> {
  await delay();
  const selectedItems = stockStore.filter(
    (item) => skus.includes(item.sku) && item.stage === 'Ready',
  );
  const selectedDestinations = initialDestinations.filter(
    (dest) => destinationIds.includes(dest.id) && dest.connected,
  );

  if (selectedItems.length === 0) {
    throw new Error('Select at least one Ready item to preview.');
  }
  if (selectedDestinations.length === 0) {
    throw new Error('Choose at least one connected destination.');
  }

  const plans: PreviewItemPlan[] = selectedItems.map((item) => ({
    sku: item.sku,
    title: item.title,
    price: item.price,
    quantityLabel: item.digital
      ? 'digital, never runs out'
      : `${item.quantity} on hand`,
    actions: selectedDestinations.map((dest) => ({
      destinationId: dest.id,
      destinationName: dest.name,
      actionSummary: buildDestinationSummary(item, dest),
    })),
  }));

  return {
    plans,
    summary: `Preview only — nothing was sent. ${plans.length} item${plans.length === 1 ? '' : 's'} across ${selectedDestinations.length} destination${selectedDestinations.length === 1 ? '' : 's'}.`,
  };
}

export async function sendLive(
  skus: string[],
  destinationIds: string[],
  confirm: string,
): Promise<SendLiveResult> {
  await delay();
  if (confirm.trim() !== 'SEND_LIVE') {
    throw new Error('Type SEND_LIVE to confirm sending.');
  }

  const selectedItems = stockStore.filter(
    (item) => skus.includes(item.sku) && item.stage === 'Ready',
  );
  const selectedDestinations = initialDestinations.filter(
    (dest) => destinationIds.includes(dest.id) && dest.connected,
  );

  if (selectedItems.length === 0) {
    throw new Error('Select at least one Ready item to send.');
  }
  if (selectedDestinations.length === 0) {
    throw new Error('Choose at least one connected destination.');
  }

  const sentItems: StockItem[] = [];
  for (const item of selectedItems) {
    const updated: StockItem = {
      ...item,
      stage: 'Listed',
      missing: [],
    };
    replaceItem(updated);
    sentItems.push(cloneItem(updated));
  }

  const destinationNames = selectedDestinations.map((d) => d.name);

  return {
    sentItems,
    destinationNames,
    message: `Prototype run complete (nothing posted externally): moved ${sentItems.length} item${sentItems.length === 1 ? '' : 's'} to Listed for ${destinationNames.join(', ')}.`,
  };
}
