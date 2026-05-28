import { NextRequest, NextResponse } from 'next/server';
import { dataUrlToBase64, factChatText, getFactChatConfig } from '@/lib/factchat';

export const dynamic = 'force-dynamic';

function inferAudioFormat(file: File) {
  const fromType = file.type.split('/')[1]?.split(';')[0];
  if (fromType) return fromType.replace('mpeg', 'mp3');

  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension || 'mp3';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 25MB 이하여야 합니다.' }, { status: 400 });
    }

    const config = getFactChatConfig();
    const bytes = Buffer.from(await file.arrayBuffer());
    const format = inferAudioFormat(file);
    const audioData = dataUrlToBase64(bytes.toString('base64'));

    const transcript = await factChatText({
      model: config.audioModel,
      maxTokens: 4096,
      messages: [
        {
          role: 'system',
          content:
            '당신은 한국어 회의 음성 전사 전문가입니다. 오디오를 가능한 한 정확하게 한국어 텍스트로 전사하세요. 요약하지 말고 발화 내용을 문단으로 정리하세요.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '이 오디오 파일을 한국어 텍스트로 전사하세요.',
            },
            {
              type: 'input_audio',
              input_audio: {
                data: audioData,
                format,
              },
            },
          ],
        },
      ],
    });

    const summary = await factChatText({
      maxTokens: 1800,
      messages: [
        {
          role: 'system',
          content:
            '당신은 회의록 요약 전문가입니다. 주요 안건, 논의 내용, 결정사항, 액션아이템으로 나누어 간결하게 요약하세요.',
        },
        { role: 'user', content: `다음 텍스트를 요약하세요:\n\n${transcript}` },
      ],
    });

    return NextResponse.json({ transcript, summary });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `성남 AI API 오디오 처리 실패: ${error.message}`
            : '성남 AI API 오디오 처리에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
