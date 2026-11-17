export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:5" | "3:2" | "2:3";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: "image" | "video";
  costPerGen: number;
  description: string;
  badge?: string;
}

export interface GenerationItem {
  id: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  aspectRatio: AspectRatio;
  imageUrl: string;
  status: "ready" | "generating" | "failed";
  cost: number;
  createdAt: string;
  dimensions: string;
  seed: number;
  isFavorite?: boolean;
  type: "image" | "video";
  videoUrl?: string;
}
