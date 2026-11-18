export type StockStage =
  | 'Intake'
  | 'Needs review'
  | 'Ready'
  | 'Listed'
  | 'Sold'
  | 'Archived';

export type ItemCondition =
  | 'New'
  | 'New with tags'
  | 'New in box'
  | 'Like new'
  | 'Used'
  | 'For parts';

export interface StockItem {
  sku: string;
  title: string;
  price: number | null;
  quantity: number;
  condition: ItemCondition;
  location: string;
  image_url: string | null;
  stage: StockStage;
  missing: string[];
  digital: boolean;
  canBringBack: boolean;
}

export interface StageSummary {
  stage: StockStage;
  label: string;
  description: string;
  itemCount: number;
  unitCount: number;
}

export type DestinationIconKey =
  | 'ebay'
  | 'store'
  | 'whatnot'
  | 'facebook'
  | 'instagram';

export interface Destination {
  id: string;
  name: string;
  connected: boolean;
  note: string;
  iconKey: DestinationIconKey;
}

export interface SendRule {
  enabled: boolean;
  destinationIds: string[];
}

export interface AddItemInput {
  title: string;
  quantity: number;
  condition: ItemCondition;
  location: string;
  price: number | null;
}

export interface UpdateItemInput {
  title?: string;
  price?: number | null;
  quantity?: number;
  condition?: ItemCondition;
  location?: string;
}

export interface StockListResponse {
  items: StockItem[];
  stages: StageSummary[];
  totalItems: number;
  totalUnits: number;
}

export interface StockMutationResult {
  item: StockItem;
  message: string;
}

export interface PreviewDestinationAction {
  destinationId: string;
  destinationName: string;
  actionSummary: string;
}

export interface PreviewItemPlan {
  sku: string;
  title: string;
  price: number | null;
  quantityLabel: string;
  actions: PreviewDestinationAction[];
}

export interface PreviewSendResult {
  plans: PreviewItemPlan[];
  summary: string;
}

export interface SendLiveResult {
  sentItems: StockItem[];
  destinationNames: string[];
  message: string;
}
