import { apiError, parseConfig, proxyJson } from '../_utils';

type ClientMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatBody = {
  model?: string;
  systemPrompt?: string;
  messages?: ClientMessage[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatBody & Parameters<typeof parseConfig>[0];
    const config = parseConfig(body);
    const model = body.model?.trim();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!model) {
      throw new Error('모델을 선택해야 합니다.');
    }

    if (!messages.length) {
      throw new Error('전송할 메시지가 없습니다.');
    }

    return proxyJson(`${config.baseUrl}/chat/completions/`, config.apiKey, {
      method: 'POST',
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              body.systemPrompt ||
              '성남시 AI API 모바일 클라이언트의 assistant로서 정확하고 간결하게 답변하세요.',
          },
          ...messages.slice(-12).map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
        temperature: 0.25,
        max_tokens: 1600,
      }),
    });
  } catch (error) {
    return apiError(error);
  }
}
