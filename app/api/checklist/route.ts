import { NextRequest, NextResponse } from 'next/server';

// ODT 생성은 Python 의존성(odfpy) 때문에 Vercel에서 직접 실행 불가.
// 현재는 안내 메시지를 반환하며, 추후 별도 Python API 서버 연동 시 확장 가능.
export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error:
        '점검표 생성 기능은 ODT 처리를 위해 별도 서버가 필요합니다. ' +
        '현재 Vercel 환경에서는 지원되지 않습니다. ' +
        '원본 Streamlit 앱에서 이용하시거나, Python FastAPI 서버를 별도로 구성해주세요.',
    },
    { status: 501 }
  );
}
