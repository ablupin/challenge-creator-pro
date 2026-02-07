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

export interface BrochureFormatConfig {
  colors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
    cardBg: [number, number, number];
    text: [number, number, number];
  };
  layout: {
    pageFormat: 'a4' | 'letter';
    margin: 'small' | 'medium' | 'large';
    imageRatio: number;
    heroBannerHeight: 'hidden' | 'small' | 'medium' | 'large';
  };
  typography: {
    titleSize: number;
    headerSize: number;
    bodySize: number;
  };
  branding: {
    customTitle: string;
    tagline: string;
    showDisclaimer: boolean;
  };
}

export const DEFAULT_FOOD_FORMAT: BrochureFormatConfig = {
  colors: {
    primary: [234, 88, 12],
    secondary: [251, 146, 60],
    accent: [254, 215, 170],
    cardBg: [255, 247, 237],
    text: [30, 30, 30],
  },
  layout: {
    pageFormat: 'a4',
    margin: 'medium',
    imageRatio: 0.5,
    heroBannerHeight: 'medium',
  },
  typography: {
    titleSize: 48,
    headerSize: 22,
    bodySize: 9,
  },
  branding: {
    customTitle: 'Food Challenge',
    tagline: 'Your transformation starts here',
    showDisclaimer: true,
  },
};

export const DEFAULT_FITNESS_FORMAT: BrochureFormatConfig = {
  colors: {
    primary: [37, 99, 235],
    secondary: [96, 165, 250],
    accent: [191, 219, 254],
    cardBg: [239, 246, 255],
    text: [30, 30, 30],
  },
  layout: {
    pageFormat: 'a4',
    margin: 'medium',
    imageRatio: 0.5,
    heroBannerHeight: 'medium',
  },
  typography: {
    titleSize: 48,
    headerSize: 22,
    bodySize: 9,
  },
  branding: {
    customTitle: 'Fitness Challenge',
    tagline: 'Your transformation starts here',
    showDisclaimer: true,
  },
};
