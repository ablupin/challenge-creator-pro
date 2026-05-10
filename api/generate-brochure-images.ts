import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });

  const { type, dayMeals, dayExercises, theme, numberOfDays } = req.body;

  // Generate hero image
  const heroPrompt = type === 'food'
    ? `Professional food photography, beautiful spread of healthy ${theme} dishes, vibrant colors, studio lighting, top-down view, magazine quality`
    : `Energetic fitness motivation, person working out, ${theme} training, dynamic lighting, sports photography style`;

  const heroResponse = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'dall-e-3', prompt: heroPrompt, n: 1, size: '1024x1024', quality: 'standard' })
  });

  const heroData = await heroResponse.json();
  const heroImageUrl = heroData.data?.[0]?.url || null;

  // Generate up to 3 content images (keep it fast)
  const contentImages: string[] = [];
  const items = type === 'food'
    ? (dayMeals?.[0] || []).slice(0, 3).map((m: any) => m.mealName)
    : (dayExercises?.[0] || []).slice(0, 3).map((e: any) => e.name);

  for (const item of items) {
    const prompt = type === 'food'
      ? `Professional food photography of ${item}, beautiful plating, natural lighting, magazine quality`
      : `Professional fitness photo demonstrating ${item} exercise, proper form, gym setting`;

    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024', quality: 'standard' })
    });
    const data = await resp.json();
    contentImages.push(data.data?.[0]?.url || '');
  }

  return res.status(200).json({ heroImageUrl, contentImages });
}
