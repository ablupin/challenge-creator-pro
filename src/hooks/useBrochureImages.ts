import { useState, useCallback } from 'react';
import { Challenge, FoodChallenge, FitnessChallenge, FoodDay, FitnessDay } from '@/types/challenge';
import { BrochureImages } from '@/types/brochure';

const initialState: BrochureImages = {
  heroImages: [],
  contentImages: [],
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

    // Prepare request data
    let meals: { mealName: string; ingredients: string[] }[] | undefined;
    let exercises: { name: string }[] | undefined;

    if (isFood) {
      const plan = challenge.plan as FoodDay[];
      // Get unique meals (first occurrence of each meal name)
      const seenMeals = new Set<string>();
      meals = [];
      for (const day of plan) {
        for (const meal of day.meals) {
          if (!seenMeals.has(meal.name)) {
            seenMeals.add(meal.name);
            meals.push({ mealName: meal.name, ingredients: meal.ingredients });
          }
        }
      }
    } else {
      const plan = challenge.plan as FitnessDay[];
      // Get unique exercises
      const seenExercises = new Set<string>();
      exercises = [];
      for (const day of plan) {
        if (!day.isRestDay) {
          for (const exercise of day.exercises) {
            if (!seenExercises.has(exercise.name)) {
              seenExercises.add(exercise.name);
              exercises.push({ name: exercise.name });
            }
          }
        }
      }
    }

    const totalImages = 2 + (meals?.length || exercises?.length || 0);

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
          meals,
          exercises,
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
        contentImages: data.contentImages || [],
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
