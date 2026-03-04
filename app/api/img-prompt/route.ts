import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });
  const { prompt, style, aspectRatio } = await req.json();

  const systemPrompt = `You are an expert image prompt engineer.
Convert the user's Korean description into a structured image generation prompt.
Return JSON with two fields:
- "positive": detailed English prompt for image generation (include style: ${style}, aspect ratio: ${aspectRatio})
- "negative": negative prompt to avoid common issues

Be specific and detailed. Return ONLY valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser description: ${prompt}` }] }],
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }
    return NextResponse.json({ positive: text, negative: '' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
