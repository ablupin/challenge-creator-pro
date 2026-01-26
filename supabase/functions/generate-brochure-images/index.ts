import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MealForDay {
  mealName: string;
  ingredients: string[];
}

interface ExerciseForDay {
  name: string;
}

interface ImageGenerationRequest {
  type: 'food' | 'fitness';
  influencerPhotos: string[]; // base64 data URLs
  numberOfDays: number;
  dayMeals?: MealForDay[][]; // dayMeals[dayIndex] = array of meals for that day
  dayExercises?: ExerciseForDay[][]; // dayExercises[dayIndex] = array of exercises
  theme: string;
}

async function generateImage(
  prompt: string,
  apiKey: string,
  sourceImage?: string
): Promise<string | null> {
  try {
    const messages: any[] = [{
      role: "user",
      content: sourceImage 
        ? [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: sourceImage } }
          ]
        : prompt
    }];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages,
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      console.error("Image generation failed:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    return imageUrl || null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

// Varied hero scene prompts to use across all days
const foodHeroPrompts = [
  (theme: string) => `Transform this person into a professional lifestyle photo of them joyfully cooking a healthy ${theme} meal in a beautiful modern kitchen. Natural lighting, warm tones, magazine quality photography.`,
  (theme: string) => `Create a professional photo of this person enjoying a healthy ${theme} meal at a beautifully styled dining table. Soft natural lighting, lifestyle magazine quality.`,
  (theme: string) => `Professional photo of this person plating a beautiful ${theme} dish with care and precision. Kitchen background, natural lighting.`,
  (theme: string) => `This person shopping for fresh ${theme} ingredients at a colorful farmers market. Candid, lifestyle photography.`,
  (theme: string) => `This person preparing fresh ingredients on a cutting board, ${theme} cooking scene. Bright kitchen, warm atmosphere.`,
  (theme: string) => `This person holding a finished healthy ${theme} dish proudly, smiling at camera. Restaurant quality presentation.`,
  (theme: string) => `This person tasting a delicious ${theme} meal with eyes closed in enjoyment. Natural home setting.`,
];

const fitnessHeroPrompts = [
  (theme: string) => `Transform this person into a professional fitness photo of them doing a ${theme} workout in a modern gym. Dynamic pose, motivational.`,
  (theme: string) => `Create a professional photo of this person stretching or warming up for a ${theme} workout. Athletic wear, energetic.`,
  (theme: string) => `This person in a powerful ${theme} exercise stance, focused and determined. Professional sports photography.`,
  (theme: string) => `This person taking a water break during ${theme} training, looking strong and confident. Gym setting.`,
  (theme: string) => `This person demonstrating perfect form in a ${theme} movement. Clean background, professional lighting.`,
  (theme: string) => `This person cooling down after an intense ${theme} session, satisfied expression. Athletic setting.`,
  (theme: string) => `This person in athletic wear ready to start ${theme} workout, motivational pose. High energy.`,
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: ImageGenerationRequest = await req.json();
    const { type, influencerPhotos, numberOfDays, dayMeals, dayExercises, theme } = body;

    const results: {
      heroImages: string[];
      dayImages: string[][];
    } = {
      heroImages: [],
      dayImages: []
    };

    const heroPrompts = type === 'food' ? foodHeroPrompts : fitnessHeroPrompts;

    // Generate ONE hero image per day for variety
    if (influencerPhotos.length > 0) {
      console.log(`Generating ${numberOfDays} hero images...`);
      
      const batchSize = 2;
      for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex += batchSize) {
        const batch: Promise<string | null>[] = [];
        
        for (let i = dayIndex; i < Math.min(dayIndex + batchSize, numberOfDays); i++) {
          const promptIndex = i % heroPrompts.length;
          const photoIndex = i % influencerPhotos.length;
          const prompt = heroPrompts[promptIndex](theme);
          batch.push(generateImage(prompt, LOVABLE_API_KEY, influencerPhotos[photoIndex]));
        }
        
        const batchResults = await Promise.all(batch);
        results.heroImages.push(...batchResults.map(img => img || ''));
        
        if (dayIndex + batchSize < numberOfDays) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    // Generate content images PER DAY (food photos or exercise illustrations)
    if (type === 'food' && dayMeals) {
      console.log(`Generating food images for ${dayMeals.length} days...`);
      
      for (let dayIndex = 0; dayIndex < dayMeals.length; dayIndex++) {
        const mealsForDay = dayMeals[dayIndex];
        const dayImageResults: string[] = [];
        
        // Generate images for each meal in this day (batch of 2-3)
        const batchSize = 2;
        for (let mealIndex = 0; mealIndex < mealsForDay.length; mealIndex += batchSize) {
          const batch = mealsForDay.slice(mealIndex, mealIndex + batchSize).map((meal) => {
            const prompt = `Beautiful professional food photography of ${meal.mealName} made with ${meal.ingredients.slice(0, 4).join(', ')}. Overhead shot, natural soft lighting, styled for Instagram, appetizing, restaurant quality presentation on a stylish plate.`;
            return generateImage(prompt, LOVABLE_API_KEY);
          });
          
          const batchResults = await Promise.all(batch);
          dayImageResults.push(...batchResults.map(img => img || ''));
          
          // Small delay between batches
          if (mealIndex + batchSize < mealsForDay.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        results.dayImages.push(dayImageResults);
        
        // Delay between days
        if (dayIndex < dayMeals.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } else if (type === 'fitness' && dayExercises) {
      console.log(`Generating exercise images for ${dayExercises.length} days...`);
      
      for (let dayIndex = 0; dayIndex < dayExercises.length; dayIndex++) {
        const exercisesForDay = dayExercises[dayIndex];
        const dayImageResults: string[] = [];
        
        // For rest days or empty, push empty array
        if (exercisesForDay.length === 0) {
          results.dayImages.push([]);
          continue;
        }
        
        // Generate images for first 3-4 exercises per day to manage load
        const exercisesToGenerate = exercisesForDay.slice(0, 4);
        const batchSize = 2;
        
        for (let exIndex = 0; exIndex < exercisesToGenerate.length; exIndex += batchSize) {
          const batch = exercisesToGenerate.slice(exIndex, exIndex + batchSize).map((exercise) => {
            const prompt = `Professional fitness photography showing the ${exercise.name} exercise. Clean gym background, proper form demonstration, motivational, high-quality sports photography.`;
            return generateImage(prompt, LOVABLE_API_KEY);
          });
          
          const batchResults = await Promise.all(batch);
          dayImageResults.push(...batchResults.map(img => img || ''));
          
          if (exIndex + batchSize < exercisesToGenerate.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        results.dayImages.push(dayImageResults);
        
        if (dayIndex < dayExercises.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    console.log(`Generated ${results.heroImages.length} hero images, ${results.dayImages.length} days of content images`);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-brochure-images:", error);
    
    const status = error instanceof Error && error.message.includes("Rate limit") ? 429 : 500;
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        heroImages: [],
        dayImages: []
      }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
