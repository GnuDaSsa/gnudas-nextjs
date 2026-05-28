export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { factChatJson } from '@/lib/factchat';
import { getCollection } from '@/lib/mongodb';

type TetoResultKey = 'teto_male' | 'teto_female' | 'egen_male' | 'egen_female';

type TetoApiBody = {
  result?: TetoResultKey;
  driveScore?: number;
  toneScore?: number;
  answerCount?: number;
};

type TetoFactChatReview = {
  oneLine: string;
  relationTip: string;
  caution: string;
};

const RESULT_LABEL: Record<TetoResultKey, string> = {
  teto_male: '테토남',
  teto_female: '테토녀',
  egen_male: '에겐남',
  egen_female: '에겐녀',
};

function normalizeResult(value: unknown): TetoResultKey | null {
  if (
    value === 'teto_male' ||
    value === 'teto_female' ||
    value === 'egen_male' ||
    value === 'egen_female'
  ) {
    return value;
  }
  return null;
}

async function buildFactChatReview(body: TetoApiBody, result: TetoResultKey) {
  try {
    return await factChatJson<TetoFactChatReview>({
      maxTokens: 600,
      messages: [
        {
          role: 'system',
          content:
            '당신은 가벼운 성향 테스트 결과를 한국어로 설명하는 카피라이터입니다. 반드시 JSON만 출력하세요. 스키마: {"oneLine":"string","relationTip":"string","caution":"string"}. 과학적 진단처럼 말하지 말고 엔터테인먼트용으로 짧고 다정하게 작성하세요.',
        },
        {
          role: 'user',
          content: [
            `결과: ${RESULT_LABEL[result]} (${result})`,
            `추진력 점수: ${body.driveScore ?? 0}`,
            `분위기 점수: ${body.toneScore ?? 0}`,
            `문항 수: ${body.answerCount ?? 0}`,
            '저장용으로 짧은 AI 리뷰를 만들어 주세요.',
          ].join('\n'),
        },
      ],
    });
  } catch (error) {
    return {
      oneLine: `${RESULT_LABEL[result]} 성향으로 저장되었습니다.`,
      relationTip: '상대의 속도와 표현 방식을 함께 보면 결과를 더 재미있게 해석할 수 있습니다.',
      caution:
        error instanceof Error
          ? `FactChat 리뷰 생성 실패: ${error.message}`
          : 'FactChat 리뷰 생성에 실패했습니다.',
    } satisfies TetoFactChatReview;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TetoApiBody;
    const result = normalizeResult(body.result);

    if (!result) {
      return NextResponse.json({ error: 'result is required' }, { status: 400 });
    }

    const aiReview = await buildFactChatReview(body, result);
    const col = await getCollection('teto_db', 'results');
    await col.insertOne({ ...body, result, aiReview, aiProvider: 'factchat', createdAt: new Date() });

    return NextResponse.json({ ok: true, aiReview, aiProvider: 'factchat' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
