import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { 담당부서, 소감주체, 담당자, 연락처, 내용 } = await req.json();

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `당신은 배태랑 기자입니다. 입력된 내용을 바탕으로 보도자료 제목 5개를 번호를 붙혀서 추천하고, 이를 '보도자료 추천 제목'이라는 진한글씨로 제목 아래 각각 ''로 묶어서 화면에 보여주세요. 각 추천 제목은 한 줄씩 출력해야합니다. 그 후 추천 제목 중 첫 번째를 주제로 보도자료를 작성하세요. 보도자료 내용은 '${내용}'을 기반으로 주제를 정하여 2500자 이상 풍부하게 작성합니다. 보도자료의 마지막 단락에는 '${소감주체}'의 소감을 풍부하게 작성하고, 담당자와 연락처는 각각 '${담당자}','${연락처}'로 작성합니다. 각 단락은 간결하고 공식적으로 작성해야 하며, 전형적인 보도자료 구조로 문장의 종결은 '이다','된다','했다'로 마무리합니다.`,
      },
    ],
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
