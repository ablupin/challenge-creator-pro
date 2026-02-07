import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

/**
 * Upload compressed influencer photos to storage and return public URLs.
 * This avoids sending large base64 payloads in the edge function request.
 */
async function uploadInfluencerPhotos(
  photos: string[],
  sessionId: string
): Promise<string[]> {
  const urls: string[] = [];

  for (let index = 0; index < photos.length; index++) {
    const photo = photos[index];
    try {
      // Convert base64 data URL to Uint8Array
      const base64 = photo.split(',')[1];
      if (!base64) {
        console.warn(`Photo ${index}: invalid data URL, skipping`);
        continue;
      }
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const filePath = `${sessionId}/influencer-${index}.jpg`;

      const { error } = await supabase.storage
        .from('brochure-images')
        .upload(filePath, bytes, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.warn(`Photo ${index} upload failed:`, error.message);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('brochure-images')
        .getPublicUrl(filePath);

      urls.push(urlData.publicUrl);
    } catch (err) {
      console.warn(`Photo ${index} upload exception:`, err);
    }
  }

  return urls;
}

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

    // Generate a unique session ID for this generation (used for storage organization)
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare data for image generation
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

    // Calculate total images to generate
    const heroCount = numberOfDays;
    let contentCount = 0;
    if (isFood && dayMeals) {
      contentCount = dayMeals.reduce((sum, day) => sum + day.length, 0);
    } else if (dayExercises) {
      contentCount = dayExercises.reduce((sum, day) => sum + Math.min(day.length, 4), 0);
    }
    const totalImages = heroCount + contentCount;

    setBrochureImages(prev => ({
      ...prev,
      isGenerating: true,
      progress: { current: 0, total: totalImages, stage: 'hero' }
    }));

    // Upload compressed photos to storage first, then pass URLs
    console.log(`Uploading ${influencerPhotos.length} influencer photos to storage...`);
    const uploadedPhotoUrls = await uploadInfluencerPhotos(
      influencerPhotos.slice(0, 5),
      sessionId
    );
    console.log(`Successfully uploaded ${uploadedPhotoUrls.length} photos`);

    let lastError: Error | null = null;

    // Retry loop
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`Generating brochure images (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        
        const { data, error } = await supabase.functions.invoke('generate-brochure-images', {
          body: {
            type: challenge.type,
            influencerPhotos: uploadedPhotoUrls, // URLs instead of base64
            numberOfDays,
            dayMeals,
            dayExercises,
            theme,
            sessionId
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          lastError = new Error(error.message || 'Failed to generate images');
          continue; // Retry
        }

        if (!data) {
          lastError = new Error('No data returned from image generation');
          continue; // Retry
        }

        console.log('Image generation response:', {
          heroCount: data.heroImages?.length || 0,
          dayCount: data.dayImages?.length || 0,
          heroValidCount: data.heroImages?.filter((u: string) => u).length || 0
        });

        const result: BrochureImages = {
          heroImages: data.heroImages || [],
          dayImages: data.dayImages || [],
          isGenerating: false,
          progress: { current: totalImages, total: totalImages, stage: 'complete' }
        };

        setBrochureImages(result);
        return result;

      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed:`, err);
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        if (attempt < MAX_RETRIES - 1) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // All retries failed
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
