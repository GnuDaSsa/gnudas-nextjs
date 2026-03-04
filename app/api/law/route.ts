import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSetting } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const LAW_API_BASE = 'http://www.law.go.kr/DRF/lawSearch.do';

async function searchLaws(oc: string, query: string) {
  try {
    const url = new URL(LAW_API_BASE);
    url.searchParams.set('OC', oc);
    url.searchParams.set('target', 'law');
    url.searchParams.set('type', 'JSON');
    url.searchParams.set('query', query);
    url.searchParams.set('display', '5');
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    return data?.LawSearch?.law ?? [];
  } catch {
    return [];
  }
}

async function searchPrecedents(oc: string, query: string) {
  try {
    const url = new URL(LAW_API_BASE);
    url.searchParams.set('OC', oc);
    url.searchParams.set('target', 'prec');
    url.searchParams.set('type', 'JSON');
    url.searchParams.set('query', query);
    url.searchParams.set('display', '5');
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    return data?.PrecSearch?.prec ?? [];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { query } = await req.json();

  const oc = process.env.LAW_API_OC || await getSetting('LAW_API_OC') || '';

  const [laws, precedents] = await Promise.all([
    searchLaws(oc, query),
    searchPrecedents(oc, query),
  ]);

  const lawSummary = laws.map((l: any) => `법령명: ${l.법령명}, 종류: ${l.법령종류}`).join('\n');
  const precSummary = precedents.map((p: any) => `판례: ${p.판례명 || p.사건명}`).join('\n');

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: '당신은 한국 법률 전문가입니다. 사용자의 질문과 관련 법령/판례를 바탕으로 친절하고 명확하게 법률 분석을 제공합니다. 법적 조언이 아닌 정보 제공임을 명시하세요.',
      },
      {
        role: 'user',
        content: `질문: ${query}\n\n관련 법령:\n${lawSummary || '검색 결과 없음'}\n\n관련 판례:\n${precSummary || '검색 결과 없음'}\n\n위 정보를 바탕으로 분석해 주세요.`,
      },
    ],
  });

  return NextResponse.json({
    laws,
    precedents,
    analysis: completion.choices[0].message.content,
  });
}
