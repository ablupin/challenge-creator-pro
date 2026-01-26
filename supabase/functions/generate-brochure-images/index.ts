import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  influencerPhotos: string[];
  numberOfDays: number;
  dayMeals?: MealForDay[][];
  dayExercises?: ExerciseForDay[][];
  theme: string;
  sessionId: string;
}

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

function base64ToBlob(base64DataUrl: string): Uint8Array {
  const base64 = base64DataUrl.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function uploadImageToStorage(
  supabase: ReturnType<typeof getSupabaseClient>,
  sessionId: string,
  imageName: string,
  imageData: string
): Promise<string | null> {
  try {
    const bytes = base64ToBlob(imageData);
    const filePath = `${sessionId}/${imageName}.jpg`;
    
    const { error } = await supabase.storage
      .from('brochure-images')
      .upload(filePath, bytes, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('brochure-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (e) {
    console.error("Upload exception:", e);
    return null;
  }
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout per image

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
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Image generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    return imageUrl || null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("Image generation timed out");
    } else {
      console.error("Image generation error:", error);
    }
    return null;
  }
}

// Varied hero scene prompts
const foodHeroPrompts = [
  (theme: string) => `Transform this person into a professional lifestyle photo of them joyfully cooking a healthy ${theme} meal in a beautiful modern kitchen. Natural lighting, warm tones, magazine quality photography.`,
  (theme: string) => `Create a professional photo of this person enjoying a healthy ${theme} meal at a beautifully styled dining table. Soft natural lighting, lifestyle magazine quality.`,
  (theme: string) => `Professional photo of this person plating a beautiful ${theme} dish with care and precision. Kitchen background, natural lighting.`,
  (theme: string) => `This person shopping for fresh ${theme} ingredients at a colorful farmers market. Candid, lifestyle photography.`,
  (theme: string) => `This person holding a finished healthy ${theme} dish proudly, smiling at camera. Restaurant quality presentation.`,
];

const fitnessHeroPrompts = [
  (theme: string) => `Transform this person into a professional fitness photo of them doing a ${theme} workout in a modern gym. Dynamic pose, motivational.`,
  (theme: string) => `Create a professional photo of this person stretching or warming up for a ${theme} workout. Athletic wear, energetic.`,
  (theme: string) => `This person in a powerful ${theme} exercise stance, focused and determined. Professional sports photography.`,
  (theme: string) => `This person taking a water break during ${theme} training, looking strong and confident. Gym setting.`,
  (theme: string) => `This person demonstrating perfect form in a ${theme} movement. Clean background, professional lighting.`,
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

    const supabase = getSupabaseClient();
    const body: ImageGenerationRequest = await req.json();
    const { type, influencerPhotos, numberOfDays, dayMeals, dayExercises, theme, sessionId } = body;

    const results: {
      heroImages: string[];
      dayImages: string[][];
    } = {
      heroImages: [],
      dayImages: []
    };

    const heroPrompts = type === 'food' ? foodHeroPrompts : fitnessHeroPrompts;

    // OPTIMIZATION: Generate hero images only for every other day (max 4)
    // This cuts generation time significantly
    const heroIndicesToGenerate = [];
    for (let i = 0; i < numberOfDays && heroIndicesToGenerate.length < 4; i += Math.max(1, Math.floor(numberOfDays / 4))) {
      heroIndicesToGenerate.push(i);
    }
    
    console.log(`Generating ${heroIndicesToGenerate.length} hero images for ${numberOfDays} days...`);

    if (influencerPhotos.length > 0) {
      for (let i = 0; i < heroIndicesToGenerate.length; i++) {
        const dayIndex = heroIndicesToGenerate[i];
        const promptIndex = i % heroPrompts.length;
        const photoIndex = i % influencerPhotos.length;
        const prompt = heroPrompts[promptIndex](theme);
        
        const imageData = await generateImage(prompt, LOVABLE_API_KEY, influencerPhotos[photoIndex]);
        
        if (imageData) {
          const url = await uploadImageToStorage(supabase, sessionId, `hero-${i}`, imageData);
          results.heroImages.push(url || '');
        } else {
          results.heroImages.push('');
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Backfill hero images for all days by cycling through generated ones
    const generatedHeroes = results.heroImages.filter(u => u);
    results.heroImages = [];
    for (let i = 0; i < numberOfDays; i++) {
      if (generatedHeroes.length > 0) {
        results.heroImages.push(generatedHeroes[i % generatedHeroes.length]);
      } else {
        results.heroImages.push('');
      }
    }

    // OPTIMIZATION: Generate only 1 image per day (for the first meal/exercise)
    // This dramatically reduces generation time
    if (type === 'food' && dayMeals) {
      console.log(`Generating 1 food image per day for ${dayMeals.length} days...`);
      
      for (let dayIndex = 0; dayIndex < dayMeals.length; dayIndex++) {
        const mealsForDay = dayMeals[dayIndex];
        const dayImageUrls: string[] = [];
        
        // Generate image for FIRST meal only, then reuse for others
        if (mealsForDay.length > 0) {
          const meal = mealsForDay[0];
          const prompt = `Beautiful professional food photography of ${meal.mealName} made with ${meal.ingredients.slice(0, 4).join(', ')}. Overhead shot, natural soft lighting, styled for Instagram, appetizing, restaurant quality presentation.`;
          
          const imageData = await generateImage(prompt, LOVABLE_API_KEY);
          
          if (imageData) {
            const url = await uploadImageToStorage(supabase, sessionId, `day-${dayIndex}-meal-0`, imageData);
            // Push the same URL for all meals in this day
            for (let i = 0; i < mealsForDay.length; i++) {
              dayImageUrls.push(url || '');
            }
          } else {
            for (let i = 0; i < mealsForDay.length; i++) {
              dayImageUrls.push('');
            }
          }
        }
        
        results.dayImages.push(dayImageUrls);
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else if (type === 'fitness' && dayExercises) {
      console.log(`Generating 1 exercise image per day for ${dayExercises.length} days...`);
      
      for (let dayIndex = 0; dayIndex < dayExercises.length; dayIndex++) {
        const exercisesForDay = dayExercises[dayIndex];
        const dayImageUrls: string[] = [];
        
        if (exercisesForDay.length === 0) {
          results.dayImages.push([]);
          continue;
        }
        
        // Generate image for FIRST exercise only
        const exercise = exercisesForDay[0];
        const prompt = `Professional fitness photography showing the ${exercise.name} exercise. Clean gym background, proper form demonstration, motivational, high-quality sports photography.`;
        
        const imageData = await generateImage(prompt, LOVABLE_API_KEY);
        
        if (imageData) {
          const url = await uploadImageToStorage(supabase, sessionId, `day-${dayIndex}-exercise-0`, imageData);
          // Push the same URL for all exercises in this day
          for (let i = 0; i < Math.min(exercisesForDay.length, 4); i++) {
            dayImageUrls.push(url || '');
          }
        } else {
          for (let i = 0; i < Math.min(exercisesForDay.length, 4); i++) {
            dayImageUrls.push('');
          }
        }
        
        results.dayImages.push(dayImageUrls);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const validHeroes = results.heroImages.filter(u => u).length;
    const validContent = results.dayImages.reduce((sum, d) => sum + (d.length > 0 && d[0] ? 1 : 0), 0);
    console.log(`Generated ${validHeroes} hero images, ${validContent} days with content images`);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-brochure-images:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        heroImages: [],
        dayImages: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
