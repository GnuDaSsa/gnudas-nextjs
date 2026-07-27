import { NextRequest, NextResponse } from 'next/server';
import { factChatText } from '@/lib/factchat';

export const maxDuration = 60;

type ClientMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatBody = {
  model?: string;
  systemPrompt?: string;
  messages?: ClientMessage[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatBody;
    const model = body.model?.trim();
    const systemPrompt = body.systemPrompt?.trim();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!model) {
      return NextResponse.json({ error: '모델을 선택해야 합니다.' }, { status: 400 });
    }

    if (!messages.length) {
      return NextResponse.json({ error: '전송할 메시지가 없습니다.' }, { status: 400 });
    }

    const clovaMessages = [
      {
        role: 'system',
        content: systemPrompt || '성남시 AI API 모바일 클라이언트의 assistant로서 정확하고 간결하게 답변하세요.',
      },
      ...messages.slice(-12).map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    const answer = await factChatText({
      messages: clovaMessages,
      model,
      maxTokens: 1600,
    });

    return NextResponse.json({
      choices: [{ message: { content: answer } }],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}