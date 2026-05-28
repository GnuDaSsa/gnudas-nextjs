import { NextRequest, NextResponse } from 'next/server';
import { factChatText } from '@/lib/factchat';

export const dynamic = 'force-dynamic';

function valueAt(body: Record<string, unknown>, index: number) {
  return String(Object.values(body)[index] ?? '').trim();
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;

  const department = String(body.department ?? body.dept ?? valueAt(body, 0));
  const spokesperson = String(body.spokesperson ?? valueAt(body, 1) ?? '관계자') || '관계자';
  const date = String(body.date ?? valueAt(body, 2));
  const contact = String(body.contact ?? valueAt(body, 3));
  const content = String(body.content ?? body.body ?? valueAt(body, 4));

  try {
    const text = await factChatText({
      maxTokens: 2200,
      messages: [
        {
          role: 'system',
          content:
            "당신은 공공기관 보도자료 작성 실무자입니다. 출력은 반드시 다음 형식을 따릅니다. 1) 첫 부분에 '보도자료 추천 제목' 2) 제목 후보 5개를 각 줄마다 작은따옴표로 감싸서 출력 3) 빈 줄 4) 보도자료 본문 초안. 본문은 공식적이고 간결한 보도자료 문체로 작성하고 문장 종결은 '이다', '했다', '밝혔다' 계열을 사용합니다.",
        },
        {
          role: 'user',
          content: [
            `담당부서: ${department}`,
            `발언주체: ${spokesperson}`,
            `해당일: ${date}`,
            `연락처: ${contact}`,
            `핵심 내용: ${content}`,
            '위 내용을 바탕으로 제목 후보 5개와 보도자료 초안을 작성하세요.',
          ].join('\n'),
        },
      ],
    });

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
