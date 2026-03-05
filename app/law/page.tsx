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
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/law', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data: LawResult = await res.json();
      setResult(data);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative' }}>
      <style>{`
        .glow { position:absolute; inset:-24px 0 auto; height:250px; pointer-events:none; filter: blur(48px); opacity:.45;
          background: radial-gradient(circle at 22% 20%, #00d4ff 0, transparent 38%), radial-gradient(circle at 80% 24%, #6b7cff 0, transparent 35%); }
        .hero { border:1px solid rgba(255,255,255,.15); border-radius:28px; background:linear-gradient(135deg, rgba(14,30,64,.88), rgba(10,12,30,.92)); padding:1.3rem; margin-bottom:16px; }
        .chip { display:inline-block; padding:.2rem .58rem; border:1px solid rgba(117,232,255,.35); border-radius:999px; font-size:.74rem; color:#9de9ff; margin-right:6px; }
        .title { font-size:clamp(1.6rem,2.8vw,2.55rem); line-height:1.15; letter-spacing:-.024em; margin:.5rem 0; }
        .sub { color:#c9d7f2; line-height:1.72; }
        .glass { border-radius:18px; border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.04); backdrop-filter: blur(10px); padding:1rem; }
        .search { display:grid; grid-template-columns: 1fr auto; gap:8px; }
        .input { width:100%; background:#0c112a; border:1px solid rgba(148,163,184,.28); border-radius:12px; color:#eef4ff; padding:.72rem .82rem; }
        .primary { background:linear-gradient(90deg,#00d4ff,#6b7cff); color:#fff; border:none; border-radius:12px; font-weight:800; padding:.75rem 1.1rem; }
        .list-item { padding:.72rem 0; border-bottom:1px solid rgba(255,255,255,.08); }
        .meta { color:#9fc0e7; font-size:.86rem; }
        .analysis { white-space:pre-wrap; line-height:1.78; }
        .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
        @media (max-width:920px){ .search,.grid2{grid-template-columns:1fr;} }
      `}</style>

      <div className="glow" />
      <section className="hero">
        <span className="chip">Law</span><span className="chip">Case</span><span className="chip">Context-first</span>
        <h1 className="title">법령·판례를 찾고, 핵심 쟁점만 빠르게 확인</h1>
        <p className="sub">검색 결과는 참고용 요약입니다. 실제 판단 전에는 최신 개정 여부와 원문을 반드시 확인하세요.</p>
      </section>

      <section className="glass" style={{ marginBottom: 14 }}>
        <div className="search">
          <input className="input" value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&search()} placeholder="예: 근로기준법 해고예고수당 계산" />
          <button className="primary" onClick={search} disabled={loading}>{loading ? '검색 중...' : '핵심 쟁점 확인'}</button>
        </div>
      </section>

      {loading && <section className="glass"><p className="sub" style={{ margin: 0 }}>법률 정보를 조회하고 분석 중입니다...</p></section>}

      {result && (
        <>
          <section className="glass" style={{ marginBottom: 14 }}>
            <div className="meta" style={{ marginBottom: 8 }}>AI 분석</div>
            <div className="analysis">{result.analysis}</div>
          </section>

          <section className="grid2">
            {result.laws?.length > 0 && (
              <div className="glass">
                <div className="meta" style={{ marginBottom: 8 }}>관련 법령</div>
                {result.laws.map((law, i) => (
                  <div key={`${law.법령명}-${i}`} className="list-item">
                    <div style={{ fontWeight: 700 }}>{law.법령명}</div>
                    <div className="meta">{law.법령종류 ?? '-'} · {law.시행일자 ?? '-'}</div>
                  </div>
                ))}
              </div>
            )}
            {result.precedents?.length > 0 && (
              <div className="glass">
                <div className="meta" style={{ marginBottom: 8 }}>관련 판례</div>
                {result.precedents.map((prec, i) => (
                  <div key={`${prec.판례명 || prec.사건명 || 'prec'}-${i}`} className="list-item">
                    <div style={{ fontWeight: 700 }}>{prec.판례명 || prec.사건명 || '판례명 없음'}</div>
                    <div className="meta">{prec.선고일자 ?? '-'} · {prec.법원명 ?? '-'}</div>
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
