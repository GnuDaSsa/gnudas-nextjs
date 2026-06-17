import { NextRequest, NextResponse } from 'next/server';
import { factChatFetch } from '@/lib/factchat';

export const dynamic = 'force-dynamic';

const REQUIRED_IMAGE_MODEL = 'gpt-image-2';

type ImageItem = {
  url?: string;
  b64_json?: string;
  base64?: string;
  bytesBase64Encoded?: string;
  imageBase64?: string;
  image_url?: string;
  imageUrl?: string;
  asset_url?: string;
  content?: string;
  revised_prompt?: string;
};

type ImageGenerateResponse = {
  data?: ImageItem[];
  images?: ImageItem[];
  image?: string;
  image_url?: string;
  imageUrl?: string;
  url?: string;
  b64_json?: string;
  base64?: string;
  output?: unknown;
  operation_id?: string;
  status?: string;
};

function asDataUrl(value: string) {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  return `data:image/png;base64,${value}`;
}

function extractImageUrl(data: ImageGenerateResponse): string | null {
  const firstData = data.data?.[0];
  const firstImage = data.images?.[0];
  const candidates = [
    firstData?.url,
    firstData?.b64_json,
    firstData?.base64,
    firstData?.bytesBase64Encoded,
    firstData?.imageBase64,
    firstData?.image_url,
    firstData?.imageUrl,
    firstData?.asset_url,
    firstData?.content,
    firstImage?.url,
    firstImage?.b64_json,
    firstImage?.base64,
    firstImage?.bytesBase64Encoded,
    firstImage?.imageBase64,
    firstImage?.image_url,
    firstImage?.imageUrl,
    firstImage?.asset_url,
    firstImage?.content,
    data.url,
    data.image,
    data.image_url,
    data.imageUrl,
    data.b64_json,
    data.base64,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return asDataUrl(candidate.trim());
    }
  }

  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (typeof item === 'string' && item.trim()) return asDataUrl(item.trim());
      if (item && typeof item === 'object') {
        const outputItem = item as ImageItem;
        const extracted =
          outputItem.url ||
          outputItem.b64_json ||
          outputItem.base64 ||
          outputItem.bytesBase64Encoded ||
          outputItem.imageBase64 ||
          outputItem.image_url ||
          outputItem.imageUrl ||
          outputItem.asset_url ||
          outputItem.content;
        if (extracted) return asDataUrl(extracted);
      }
    }
  }

  return null;
}

function summarizeShape(data: ImageGenerateResponse) {
  const topLevel = Object.keys(data).sort().join(', ') || 'empty object';
  const firstData = data.data?.[0];
  const firstDataKeys = firstData ? Object.keys(firstData).sort().join(', ') : '';
  const dataLength = Array.isArray(data.data) ? `; data.length=${data.data.length}` : '';
  return firstDataKeys ? `${topLevel}${dataLength}; data[0]: ${firstDataKeys}` : `${topLevel}${dataLength}`;
}

function imageSizeForAspectRatio(aspectRatio?: string) {
  switch (aspectRatio) {
    case '9:16':
      return '1024x1536';
    case '16:9':
      return '1536x1024';
    case '1:1':
    default:
      return '1024x1024';
  }
}

export async function POST(req: NextRequest) {
  const { prompt, aspectRatio } = await req.json();

  try {
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: '이미지 생성 프롬프트가 필요합니다.' }, { status: 400 });
    }

    const payload = {
      model: REQUIRED_IMAGE_MODEL,
      prompt: prompt.trim(),
      size: imageSizeForAspectRatio(aspectRatio),
      n: 1,
    };

    const data = (await factChatFetch('/images/generate/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })) as ImageGenerateResponse;

    const imageDataUrl = extractImageUrl(data);
    if (imageDataUrl) {
      return NextResponse.json({ imageDataUrl, model: REQUIRED_IMAGE_MODEL });
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

    return NextResponse.json(
      {
        imageDataUrl: null,
        error: `이미지 생성 응답에서 이미지 URL/base64를 찾지 못했습니다. 응답 필드: ${summarizeShape(data)}`,
      },
      { status: 502 },
    );
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
