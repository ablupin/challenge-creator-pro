export interface BrochureImages {
  heroImages: string[]; // One per day for variety
  dayImages: string[][]; // dayImages[dayIndex][mealIndex] = image URL
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
