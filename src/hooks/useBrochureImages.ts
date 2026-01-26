import { useState, useCallback } from 'react';
import { Challenge, FoodChallenge, FitnessChallenge, FoodDay, FitnessDay } from '@/types/challenge';
import { BrochureImages } from '@/types/brochure';

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

  const generateImages = useCallback(async (challenge: Challenge): Promise<BrochureImages> => {
    const isFood = challenge.type === 'food';
    
    // Get influencer photos
    const photoPreviews = isFood
      ? (challenge as FoodChallenge).input.photoPreviews || []
      : (challenge as FitnessChallenge).input.photoPreviews || [];

    const theme = isFood
      ? (challenge as FoodChallenge).input.dietTheme
      : (challenge as FitnessChallenge).input.workoutTheme;

    const numberOfDays = isFood
      ? (challenge as FoodChallenge).input.numberOfDays
      : (challenge as FitnessChallenge).input.numberOfDays;

    // Prepare structured day-based data
    let dayMeals: { mealName: string; ingredients: string[] }[][] | undefined;
    let dayExercises: { name: string }[][] | undefined;

    if (isFood) {
      const plan = challenge.plan as FoodDay[];
      dayMeals = plan.map(day => 
        day.meals.map(meal => ({ mealName: meal.name, ingredients: meal.ingredients }))
      );
    } else {
      const plan = challenge.plan as FitnessDay[];
      dayExercises = plan.map(day => 
        day.isRestDay ? [] : day.exercises.map(ex => ({ name: ex.name }))
      );
    }

    // Calculate total images to generate
    const totalMeals = dayMeals?.reduce((sum, day) => sum + day.length, 0) || 0;
    const totalExercises = dayExercises?.reduce((sum, day) => sum + Math.min(day.length, 4), 0) || 0;
    const totalImages = numberOfDays + (totalMeals || totalExercises);

    setBrochureImages({
      ...initialState,
      isGenerating: true,
      progress: { current: 0, total: totalImages, stage: 'hero' }
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brochure-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: challenge.type,
          influencerPhotos: photoPreviews,
          numberOfDays,
          dayMeals,
          dayExercises,
          theme
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate images');
      }

      const data = await response.json();

      const result: BrochureImages = {
        heroImages: data.heroImages || [],
        dayImages: data.dayImages || [],
        isGenerating: false,
        progress: { current: totalImages, total: totalImages, stage: 'complete' }
      };

      setBrochureImages(result);
      return result;

    } catch (error) {
      console.error('Error generating brochure images:', error);
      
      // Return empty state on error
      const errorState: BrochureImages = {
        ...initialState,
        progress: { current: 0, total: 0, stage: 'idle' }
      };
      setBrochureImages(errorState);
      throw error;
    }
  }, []);

  const resetImages = useCallback(() => {
    setBrochureImages(initialState);
  }, []);

  return {
    brochureImages,
    generateImages,
    resetImages
  };
}
