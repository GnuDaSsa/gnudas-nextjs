import { NextRequest, NextResponse } from 'next/server';
import { factChatJson, factChatText } from '@/lib/factchat';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { prompt, style, aspectRatio } = await req.json();

  const systemPrompt = `You are an expert image prompt engineer.
Convert the user's Korean description into a detailed English image generation prompt.
Include the style (${style}) and aspect ratio context (${aspectRatio}) naturally in the prompt.
Return JSON with one field:
- "prompt": a detailed, vivid English prompt for image generation

Be specific about lighting, composition, mood, and visual details. Return ONLY valid JSON.`;

  try {
    try {
      const parsed = await factChatJson<{ prompt?: string }>({
        maxTokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User description: ${prompt}` },
        ],
      });
      return NextResponse.json({ prompt: parsed.prompt || '' });
    } catch {
      const text = await factChatText({
        maxTokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User description: ${prompt}` },
        ],
      });
      return NextResponse.json({ prompt: text });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
