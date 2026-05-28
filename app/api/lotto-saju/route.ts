import { NextRequest, NextResponse } from 'next/server';

import { factChatJson } from '@/lib/factchat';
import { buildLottoSaju } from '@/lib/lotto-saju';

export const dynamic = 'force-dynamic';

type LottoSajuResult = Awaited<ReturnType<typeof buildLottoSaju>>;

type FactChatLottoEnhancement = {
  profileSummary?: string;
  connectionSummary?: string;
  ticketAngles?: string[];
  ticketReasonTone?: string;
};

async function enhanceWithFactChat(result: LottoSajuResult) {
  try {
    const enhancement = await factChatJson<FactChatLottoEnhancement>({
      maxTokens: 900,
      messages: [
        {
          role: 'system',
          content:
            '당신은 엔터테인먼트용 사주/로또 설명 카피를 다듬는 한국어 도우미입니다. 반드시 JSON만 출력하세요. 스키마: {"profileSummary":"string","connectionSummary":"string","ticketAngles":["string"],"ticketReasonTone":"string"}. 도박 당첨을 보장하거나 예언처럼 말하지 말고, 재미용/확률 독립성을 유지하세요.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            profile: {
              name: result.profile.name,
              dominantElement: result.profile.dominantElement.label,
              supportElement: result.profile.supportElement.label,
              cautiousElement: result.profile.cautiousElement.label,
              currentSummary: result.profile.summary,
              currentConnectionSummary: result.profile.connectionGuide.summary,
            },
            history: {
              source: result.history.source,
              latestDrawNo: result.history.latestDrawNo,
              hotNumbers: result.history.hotNumbers,
              coldNumbers: result.history.coldNumbers,
            },
            ticketCount: result.tickets.length,
          }),
        },
      ],
    });

    return {
      ...result,
      profile: {
        ...result.profile,
        summary: enhancement.profileSummary?.trim() || result.profile.summary,
        connectionGuide: {
          ...result.profile.connectionGuide,
          summary: enhancement.connectionSummary?.trim() || result.profile.connectionGuide.summary,
        },
      },
      tickets: result.tickets.map((ticket, index) => ({
        ...ticket,
        angle: enhancement.ticketAngles?.[index]?.trim() || ticket.angle,
        reasons: ticket.reasons.map((reason) => ({
          ...reason,
          why: enhancement.ticketReasonTone?.trim()
            ? `${reason.why} · ${enhancement.ticketReasonTone.trim()}`
            : reason.why,
        })),
      })),
      aiProvider: 'factchat',
      aiEnhanced: true,
    };
  } catch (error) {
    return {
      ...result,
      aiProvider: 'factchat',
      aiEnhanced: false,
      aiError:
        error instanceof Error
          ? `FactChat 사주로또 설명 보강 실패: ${error.message}`
          : 'FactChat 사주로또 설명 보강에 실패했습니다.',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      birthDate?: string;
      birthTime?: string;
      ticketCount?: number;
    };

    if (!body.birthDate) {
      return NextResponse.json({ error: 'birthDate is required' }, { status: 400 });
    }

    const result = await buildLottoSaju({
      name: body.name,
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      ticketCount: body.ticketCount,
    });

    const enhanced = await enhanceWithFactChat(result);
    return NextResponse.json(enhanced);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'unknown error' },
      { status: 500 },
    );
  }
}
