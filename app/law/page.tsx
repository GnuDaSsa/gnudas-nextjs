'use client';
import { useState } from 'react';

type LawItem = { 법령명: string; 법령종류?: string; 시행일자?: string };
type PrecedentItem = { 판례명?: string; 사건명?: string; 선고일자?: string; 법원명?: string };
type LawResult = { laws: LawItem[]; precedents: PrecedentItem[]; analysis: string };

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
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <style>{`
        .n-hero { border:1px solid rgba(148,163,184,.25); background: linear-gradient(135deg,#152032 0%, #0f1115 70%); border-radius:14px; padding:18px; margin-bottom:14px; }
        .n-chip { display:inline-block; padding:2px 10px; border-radius:999px; border:1px solid rgba(125,211,252,.45); color:#bae6fd; font-size:.72rem; margin-right:6px; }
        .n-h1 { font-size:2.1rem; font-weight:700; letter-spacing:-.02em; margin:10px 0 8px; color:#f9fafb; }
        .n-sub { color:#9ca3af; margin:0; line-height:1.7; }
        .n-sec { border:1px solid rgba(255,255,255,.1); background:linear-gradient(180deg,#12151d,#101217); border-radius:12px; padding:20px; margin-bottom:14px; }
        .n-search { display:grid; grid-template-columns:1fr auto; gap:8px; }
        .n-input { width:100%; border:1px solid rgba(255,255,255,.14); background:#0f1115; color:#f3f4f6; border-radius:8px; padding:.66rem .74rem; font-size:.93rem; }
        .n-btn { border:1px solid rgba(255,255,255,.18); background:#f3f4f6; color:#111827; border-radius:8px; padding:.62rem .98rem; font-weight:600; cursor:pointer; }
        .n-label { font-size:.82rem; color:#9ca3af; margin-bottom:8px; }
        .n-analysis { white-space: pre-wrap; color:#e5e7eb; line-height:1.76; }
        .n-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .n-item { padding:.68rem 0; border-bottom:1px solid rgba(255,255,255,.08); }
        .n-meta { color:#9ca3af; font-size:.84rem; margin-top:3px; }
        @media (max-width:900px){ .n-search,.n-grid{grid-template-columns:1fr;} .n-h1{font-size:1.7rem;} }
      `}</style>

      <section className="n-hero">
        <span className="n-chip">Dribbble</span>
        <span className="n-chip">Evidence First</span>
        <span className="n-chip">Minimal UI</span>
        <h1 className="n-h1">AI 법률 검색</h1>
        <p className="n-sub">법령/판례를 검색해 핵심 쟁점을 빠르게 확인합니다. 결과는 참고용이며 실제 판단 전 원문 확인이 필요합니다.</p>
      </section>

      <section className="n-sec">
        <div className="n-search">
          <input className="n-input" value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&search()} placeholder="예: 근로기준법 해고예고수당 계산" />
          <button className="n-btn" onClick={search} disabled={loading}>{loading ? '검색 중...' : '검색'}</button>
        </div>
      </section>

      {loading && <section className="n-sec"><p className="n-sub" style={{ margin: 0 }}>법률 정보를 조회하고 있습니다...</p></section>}

      {result && (
        <>
          <section className="n-sec">
            <div className="n-label">AI 분석</div>
            <div className="n-analysis">{result.analysis}</div>
          </section>

          <section className="n-grid">
            {result.laws?.length > 0 && (
              <div className="n-sec" style={{ marginBottom: 0 }}>
                <div className="n-label">관련 법령</div>
                {result.laws.map((law, i) => (
                  <div key={`${law.법령명}-${i}`} className="n-item">
                    <div style={{ color: '#f3f4f6', fontWeight: 600 }}>{law.법령명}</div>
                    <div className="n-meta">{law.법령종류 ?? '-'} · {law.시행일자 ?? '-'}</div>
                  </div>
                ))}
              </div>
            )}

            {result.precedents?.length > 0 && (
              <div className="n-sec" style={{ marginBottom: 0 }}>
                <div className="n-label">관련 판례</div>
                {result.precedents.map((prec, i) => (
                  <div key={`${prec.판례명 || prec.사건명 || 'prec'}-${i}`} className="n-item">
                    <div style={{ color: '#f3f4f6', fontWeight: 600 }}>{prec.판례명 || prec.사건명 || '판례명 없음'}</div>
                    <div className="n-meta">{prec.선고일자 ?? '-'} · {prec.법원명 ?? '-'}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
