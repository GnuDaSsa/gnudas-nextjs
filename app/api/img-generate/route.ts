import { NextRequest, NextResponse } from 'next/server';
import { factChatFetch, getFactChatConfig } from '@/lib/factchat';

export const dynamic = 'force-dynamic';

type ImageGenerateResponse = {
  data?: Array<{ url?: string }>;
  operation_id?: string;
  status?: string;
};

export async function POST(req: NextRequest) {
  const { prompt, aspectRatio } = await req.json();

  try {
    const config = getFactChatConfig();
    const data = (await factChatFetch('/images/generate/', {
      method: 'POST',
      body: JSON.stringify({
        model: config.imageModel,
        prompt,
        aspect_ratio: aspectRatio || '1:1',
        number_of_images: 1,
      }),
    })) as ImageGenerateResponse;

    const imageDataUrl = data.data?.[0]?.url || null;
    if (imageDataUrl) {
      return NextResponse.json({ imageDataUrl });
    }

    if (data.operation_id) {
      return NextResponse.json(
        {
          imageDataUrl: null,
          error: `이미지 생성이 비동기 처리 중입니다. operation_id=${data.operation_id}, status=${data.status || 'processing'}`,
        },
        { status: 202 },
      );
    }

    return NextResponse.json({ imageDataUrl: null });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
