'use client';
import { useState } from 'react';

type LawItem = {
  법령명: string;
  법령종류?: string;
  시행일자?: string;
};

type PrecedentItem = {
  판례명?: string;
  사건명?: string;
  선고일자?: string;
  법원명?: string;
};

type LawResult = {
  laws: LawItem[];
  precedents: PrecedentItem[];
  analysis: string;
};

export default function LawPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<LawResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/law', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data: LawResult = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .page-wrap { max-width: 1040px; margin: 0 auto; color: #eef4ff; }
        .hero { display: grid; grid-template-columns: 1.2fr .8fr; gap: 20px; margin-bottom: 20px; }
        .card { border: 1px solid rgba(125,187,255,0.22); background: rgba(8,10,34,0.55); border-radius: 16px; padding: 1.2rem; }
        .eyebrow { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #84c7ff; margin-bottom: 8px; }
        .title { font-size: 2rem; line-height: 1.25; letter-spacing: -0.02em; margin: 0 0 .6rem; }
        .sub { color: #c8d5ef; line-height: 1.7; font-size: 1.02rem; }
        .search-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-bottom: 14px; }
        .input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(125,187,255,0.26); border-radius: 10px; color: #eef4ff; padding: .7rem .88rem; font-size: .98rem; outline: none; }
        .primary { background: #6b7cff; color: white; font-weight: 800; border: none; border-radius: 11px; padding: .72rem 1.2rem; cursor: pointer; font-size: .95rem; }
        .list-item { padding: .72rem 0; border-bottom: 1px solid rgba(255,255,255,.08); }
        .meta { color: #9ec0ef; font-size: .86rem; margin-top: 2px; }
        .analysis { white-space: pre-wrap; line-height: 1.78; color: #eef4ff; }
        @media (max-width: 920px) {
          .hero { grid-template-columns: 1fr; }
          .search-row { grid-template-columns: 1fr; }
          .title { font-size: 1.6rem; }
        }
      `}</style>

      <div className="page-wrap">
        <section className="hero">
          <div className="card">
            <div className="eyebrow">Law Search</div>
            <h1 className="title">법령·판례를 찾고, 핵심 쟁점을 빠르게 정리</h1>
            <p className="sub">
              검색 결과는 참고용 요약입니다. 실제 의사결정 전에는 원문 법령/판례와 최신 개정 여부를 반드시 확인해 주세요.
            </p>
          </div>
          <div className="card">
            <div className="eyebrow">사용 팁</div>
            <p className="sub" style={{ marginTop: 0 }}>
              예시 질의<br />
              - 임금체불 신고 절차<br />
              - 해고예고수당 기준<br />
              - 건설기술진흥법 타당성조사
            </p>
          </div>
        </section>

        <section className="card" style={{ marginBottom: 14 }}>
          <div className="search-row">
            <input
              className="input"
              placeholder="예: 근로기준법 해고예고수당 계산"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
            <button className="primary" onClick={search} disabled={loading}>
              {loading ? '검색 중...' : '핵심 쟁점 확인하기'}
            </button>
          </div>
          <p className="sub" style={{ margin: 0, fontSize: '.9rem' }}>
            법령명, 분쟁 유형, 상황 키워드를 함께 넣으면 더 정확한 결과를 얻을 수 있습니다.
          </p>
        </section>

        {loading && <div className="card"><p className="sub" style={{ margin: 0 }}>법률 정보를 조회하고 분석 중입니다...</p></div>}

        {result && (
          <>
            <section className="card" style={{ marginBottom: 14 }}>
              <div className="eyebrow">AI 분석</div>
              <div className="analysis">{result.analysis}</div>
            </section>

            {result.laws?.length > 0 && (
              <section className="card" style={{ marginBottom: 14 }}>
                <div className="eyebrow">관련 법령</div>
                {result.laws.map((law, i) => (
                  <div key={`${law.법령명}-${i}`} className="list-item">
                    <div style={{ fontWeight: 700 }}>{law.법령명}</div>
                    <div className="meta">{law.법령종류 ?? '-'} · {law.시행일자 ?? '-'}</div>
                  </div>
                ))}
              </section>
            )}

            {result.precedents?.length > 0 && (
              <section className="card">
                <div className="eyebrow">관련 판례</div>
                {result.precedents.map((prec, i) => (
                  <div key={`${prec.판례명 || prec.사건명 || 'prec'}-${i}`} className="list-item">
                    <div style={{ fontWeight: 700 }}>{prec.판례명 || prec.사건명 || '판례명 없음'}</div>
                    <div className="meta">{prec.선고일자 ?? '-'} · {prec.법원명 ?? '-'}</div>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
