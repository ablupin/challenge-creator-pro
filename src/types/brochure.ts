export interface BrochureImages {
  heroImages: string[];
  contentImages: string[];
  isGenerating: boolean;
  progress: {
    current: number;
    total: number;
    stage: 'idle' | 'hero' | 'content' | 'complete';
  };
}

export interface TileConfig {
  type: 'hero' | 'header' | 'meal-card' | 'food-image' | 'exercise-card' | 'exercise-image' | 'footer' | 'rest-day';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: any;
  imageUrl?: string;
}

export interface PageLayout {
  tiles: TileConfig[];
  pageNumber: number;
}
