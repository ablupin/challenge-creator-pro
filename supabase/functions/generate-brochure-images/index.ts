import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MealImageRequest {
  mealName: string;
  ingredients: string[];
}

interface ImageGenerationRequest {
  type: 'food' | 'fitness';
  influencerPhotos: string[]; // base64 data URLs
  meals?: MealImageRequest[];
  exercises?: { name: string }[];
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
    const { type, influencerPhotos, meals, exercises, theme } = body;

    const results: {
      heroImages: string[];
      contentImages: string[];
    } = {
      heroImages: [],
      contentImages: []
    };

    // Generate 2-3 hero images with influencer in context
    const heroPrompts = type === 'food' 
      ? [
          `Transform this person into a professional lifestyle photo of them joyfully cooking a healthy ${theme} meal in a beautiful modern kitchen. Natural lighting, warm tones, magazine quality photography. The person should look happy and engaged.`,
          `Create a professional photo of this person enjoying a healthy ${theme} meal at a beautifully styled dining table. Soft natural lighting, lifestyle magazine quality.`,
        ]
      : [
          `Transform this person into a professional fitness photo of them doing a ${theme} workout in a modern gym. Dynamic pose, motivational, professional sports photography lighting.`,
          `Create a professional photo of this person stretching or warming up for a ${theme} workout. Athletic wear, energetic, high-quality fitness magazine style.`,
        ];

    // Generate hero images in parallel (use first influencer photo)
    if (influencerPhotos.length > 0) {
      const heroPromises = heroPrompts.slice(0, 2).map((prompt, index) => {
        const photoIndex = index % influencerPhotos.length;
        return generateImage(prompt, LOVABLE_API_KEY, influencerPhotos[photoIndex]);
      });

      const heroResults = await Promise.all(heroPromises);
      results.heroImages = heroResults.filter((img): img is string => img !== null);
    }

    // Generate content images (food photos or exercise illustrations)
    if (type === 'food' && meals) {
      // Generate images for first 5-7 unique meals to avoid rate limits
      const uniqueMeals = meals.slice(0, 7);
      
      const foodPromises = uniqueMeals.map((meal) => {
        const prompt = `Beautiful professional food photography of ${meal.mealName} made with ${meal.ingredients.slice(0, 4).join(', ')}. Overhead shot, natural soft lighting, styled for Instagram, appetizing, restaurant quality presentation on a stylish plate.`;
        return generateImage(prompt, LOVABLE_API_KEY);
      });

      // Process in batches of 3 to avoid rate limits
      const batchSize = 3;
      for (let i = 0; i < foodPromises.length; i += batchSize) {
        const batch = foodPromises.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch);
        results.contentImages.push(...batchResults.filter((img): img is string => img !== null));
        
        // Small delay between batches
        if (i + batchSize < foodPromises.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } else if (type === 'fitness' && exercises) {
      // Generate exercise demonstration images
      const uniqueExercises = exercises.slice(0, 5);
      
      const exercisePromises = uniqueExercises.map((exercise) => {
        const prompt = `Professional fitness photography showing the ${exercise.name} exercise. Clean gym background, proper form demonstration, motivational, high-quality sports photography.`;
        return generateImage(prompt, LOVABLE_API_KEY);
      });

      const batchSize = 3;
      for (let i = 0; i < exercisePromises.length; i += batchSize) {
        const batch = exercisePromises.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch);
        results.contentImages.push(...batchResults.filter((img): img is string => img !== null));
        
        if (i + batchSize < exercisePromises.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

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
        contentImages: []
      }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
