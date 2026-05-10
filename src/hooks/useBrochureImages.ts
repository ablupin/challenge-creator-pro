import { useState, useCallback } from 'react';
import { Challenge, FoodChallenge, FitnessChallenge, FoodDay, FitnessDay } from '@/types/challenge';
import { BrochureImages } from '@/types/brochure';

const MAX_RETRIES = 2;

const initialState: BrochureImages = {
  heroImages: [],
  dayImages: [],
  isGenerating: false,
  progress: {
    current: 0,
    total: 0,
    stage: 'idle'
  }
};

export function useBrochureImages() {
  const [brochureImages, setBrochureImages] = useState<BrochureImages>(initialState);

  const generateBrochureImages = useCallback(async (
    challenge: Challenge,
    influencerPhotos: string[]
  ): Promise<BrochureImages> => {
    const isFood = challenge.type === 'food';
    const numberOfDays = isFood
      ? (challenge as FoodChallenge).input.numberOfDays
      : (challenge as FitnessChallenge).input.numberOfDays;
    const theme = isFood
      ? (challenge as FoodChallenge).input.dietTheme
      : (challenge as FitnessChallenge).input.workoutTheme;

    let dayMeals: { mealName: string; ingredients: string[] }[][] | undefined;
    let dayExercises: { name: string }[][] | undefined;

    if (isFood) {
      const foodPlan = challenge.plan as FoodDay[];
      dayMeals = foodPlan.map(day =>
        day.meals.map(meal => ({
          mealName: meal.name,
          ingredients: meal.ingredients
        }))
      );
    } else {
      const fitnessPlan = challenge.plan as FitnessDay[];
      dayExercises = fitnessPlan.map(day =>
        day.isRestDay ? [] : day.exercises.map(ex => ({ name: ex.name }))
      );
    }

    const totalImages = 1 + 3; // hero + up to 3 content images

    setBrochureImages(prev => ({
      ...prev,
      isGenerating: true,
      progress: { current: 0, total: totalImages, stage: 'hero' }
    }));

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`Generating brochure images via Vercel API (attempt ${attempt + 1}/${MAX_RETRIES})...`);

        const response = await fetch('/api/generate-brochure-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: challenge.type,
            numberOfDays,
            dayMeals,
            dayExercises,
            theme,
          })
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          lastError = new Error(err.error || `HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();

        const heroImages = data.heroImageUrl ? [data.heroImageUrl] : [];
        const contentImages: string[] = data.contentImages || [];

        // Build dayImages structure: hero for day 0, content for subsequent
        const dayImages: string[][] = [];
        for (let i = 0; i < numberOfDays; i++) {
          dayImages.push(i === 0 && contentImages.length > 0 ? [contentImages[0]] : []);
        }

        const result: BrochureImages = {
          heroImages,
          dayImages,
          isGenerating: false,
          progress: { current: totalImages, total: totalImages, stage: 'complete' }
        };

        setBrochureImages(result);
        return result;

      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed:`, err);
        lastError = err instanceof Error ? err : new Error('Unknown error');

        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    console.error('All image generation attempts failed:', lastError);

    const emptyResult: BrochureImages = {
      heroImages: [],
      dayImages: [],
      isGenerating: false,
      progress: { current: 0, total: totalImages, stage: 'idle' }
    };

    setBrochureImages(emptyResult);
    return emptyResult;
  }, []);

  const resetBrochureImages = useCallback(() => {
    setBrochureImages(initialState);
  }, []);

  return {
    brochureImages,
    generateBrochureImages,
    resetBrochureImages
  };
}
