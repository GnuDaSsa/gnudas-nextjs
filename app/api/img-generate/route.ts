import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });
  const { positive, aspectRatio } = await req.json();

  try {
    const imageRes = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: positive,
      config: { numberOfImages: 1, aspectRatio },
    });
    const raw = imageRes?.generatedImages?.[0]?.image;
    if (raw?.mimeType && raw?.imageBytes) {
      return NextResponse.json({ imageDataUrl: `data:${raw.mimeType};base64,${raw.imageBytes}` });
    }
    return NextResponse.json({ imageDataUrl: null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
