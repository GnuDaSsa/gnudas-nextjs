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
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { positive: text, negative: '' };

    let image: { mimeType: string; imageBytes: string } | null = null;
    try {
      const imageRes = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: parsed.positive,
        config: {
          numberOfImages: 1,
          aspectRatio,
        },
      });
      const raw = imageRes?.generatedImages?.[0]?.image;
      image = (raw?.mimeType && raw?.imageBytes) ? { mimeType: raw.mimeType, imageBytes: raw.imageBytes } : null;
    } catch {
      image = null;
    }

    return NextResponse.json({
      positive: parsed.positive || '',
      negative: parsed.negative || '',
      imageDataUrl: image ? `data:${image.mimeType};base64,${image.imageBytes}` : null,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
