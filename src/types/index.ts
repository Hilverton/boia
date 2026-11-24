export type AspectRatio =
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:5"
  | "5:4"
  | "3:2"
  | "2:3"
  | "4:3"
  | "3:4"
  | "21:9";

export type ModelMode = "image" | "video";

export type ModelQuality = "1K" | "2K" | "4K";

export interface ModelSizeMap {
  [quality: string]: {
    [aspectRatio: string]: [number, number];
  };
}

export interface AIModel {
  id: string;
  name: string;
  air: string;
  creator: string;
  provider: "Runware" | "Sjinn" | string;
  type: ModelMode;
  status: "live" | "preview" | "beta";
  costPerGen: number; // in USD
  costBrl: number; // in BRL (calculated with current exchange rate)
  description: string;
  badge?: string;
  caps?: string[];
  promptMax?: number;
  negativePrompt?: boolean;
  sizes?: ModelSizeMap;
}

export interface GenerationItem {
  id: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  modelKey?: string;
  air?: string;
  aspectRatio: AspectRatio;
  quality?: ModelQuality;
  imageUrl: string;
  videoUrl?: string;
  status: "ready" | "generating" | "failed";
  cost: number;
  costBrl?: number;
  createdAt: string;
  dimensions: string;
  seed: number;
  isFavorite?: boolean;
  type: ModelMode;
  projectId?: string;
  folderId?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  isPrivate: boolean;
  coverUrl?: string;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ElementImage {
  id: string;
  original: string;
  thumb?: string;
}

export interface ElementTag {
  id: string;
  name: string;
  version?: string;
  handle?: string; // e.g. "Rick01"
  kind: "personagem" | "local" | "adereco";
  status: "aprovado" | "andamento" | "Sem status" | "";
  triggerTag: string; // e.g. "@Rick01"
  avatarUrl?: string;
  images?: ElementImage[];
  description?: string;
  createdAt?: string;
}
