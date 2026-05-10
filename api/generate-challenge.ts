import type { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).end();
  }

  try {
    const request = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (request.type === 'food') {
      systemPrompt = `You are a professional nutritionist and meal planning expert. Generate healthy, delicious meal plans based on user requirements. Always respond with valid JSON only, no additional text.`;

      if (request.regenerateType === 'meal') {
        userPrompt = `Generate a single meal for a ${request.dietTheme} diet.

Return JSON in this exact format:
{
  "meal": {
    "name": "Meal Name",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"]
  }
}`;
      } else if (request.regenerateType === 'day') {
        userPrompt = `Generate ${request.mealsPerDay} meals for one day of a ${request.dietTheme} diet.

Return JSON in this exact format:
{
  "meals": [
    {
      "name": "Meal Name",
      "ingredients": ["ingredient 1", "ingredient 2"]
    }
  ]
}`;
      } else {
        userPrompt = `Generate a complete ${request.numberOfDays}-day meal plan with ${request.mealsPerDay} meals per day.
Diet theme: ${request.dietTheme}

Return JSON in this exact format:
{
  "days": [
    {
      "dayNumber": 1,
      "meals": [
        {
          "name": "Meal Name",
          "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"]
        }
      ]
    }
  ]
}

Include variety and ensure meals are nutritious and align with the ${request.dietTheme} theme.`;
      }
    } else {
      systemPrompt = `You are a certified personal trainer and fitness expert. Create safe, effective workout plans based on user requirements.

IMPORTANT REP FORMAT RULES:
- Use numeric reps (e.g., "12" or "8-12") for: squats, lunges, push-ups, rows, presses, curls, deadlifts, hip thrusts, leg raises, crunches, pull-ups, dips, and similar strength/resistance exercises
- Use time-based reps (e.g., "30 seconds" or "45 seconds") ONLY for: planks, wall sits, dead hangs, isometric holds, and cardio intervals like jumping jacks or high knees

Always respond with valid JSON only, no additional text.`;

      if (request.regenerateType === 'day') {
        userPrompt = `Generate a single workout for a ${request.workoutTheme} program with ${request.exercisesPerWorkout} exercises.

Return JSON in this exact format:
{
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": "12"
    }
  ]
}

REP FORMAT:
- Strength exercises (squats, presses, rows, curls, lunges, etc.): Use rep counts like "12" or "8-12"
- Isometric holds (planks, wall sits): Use time like "30 seconds"
- Cardio bursts (jumping jacks, high knees): Use time like "45 seconds"

Use appropriate sets (2-5) based on exercise type.`;
      } else {
        userPrompt = `Generate a complete ${request.numberOfDays}-day workout program.
Theme: ${request.workoutTheme}
Exercises per workout: ${request.exercisesPerWorkout}

Return JSON in this exact format:
{
  "days": [
    {
      "dayNumber": 1,
      "isRestDay": false,
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "12"
        }
      ]
    }
  ]
}

Include 1-2 rest days per week for recovery.

REP FORMAT RULES:
- Strength/resistance exercises (squats, deadlifts, presses, rows, curls, lunges, hip thrusts, leg raises, crunches, push-ups, pull-ups): Use numeric reps like "12" or "8-12"
- Isometric holds (planks, wall sits, dead hangs): Use time like "30 seconds" or "45 seconds"
- Cardio intervals (jumping jacks, mountain climbers, high knees, burpees): Use time like "30 seconds"

Use appropriate sets (2-5) based on exercise intensity.`;
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limited. Please try again in a moment.' });
      }
      const text = await response.text();
      console.error('OpenAI error:', response.status, text);
      return res.status(500).json({ error: `AI error: ${response.status}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content in AI response' });
    }

    const parsed = JSON.parse(content);
    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('generate-challenge error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
