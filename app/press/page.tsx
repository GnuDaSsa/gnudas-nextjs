'use client';
import { useState } from 'react';

export default function PressPage() {
  const [form, setForm] = useState({ 담당부서: '', 소감주체: '', 담당자: '', 연락처: '', 내용: '' });
  const [result, setResult] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!form.담당부서 || !form.내용 || !form.담당자 || !form.연락처) {
      alert('담당부서/담당자/연락처/핵심내용을 입력해 주세요.');
      return;
    }
    setLoading(true); setResult(''); setTitles([]);
    try {
      const res = await fetch('/api/press', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        setResult(full);
      }
      const titleMatches = full.match(/'([^']+)'/g);
      if (titleMatches) setTitles(titleMatches.slice(0, 5).map((t) => t.replace(/'/g, '')));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
      <style>{`
        .halo { position:absolute; inset:-20px 0 auto; height:260px; pointer-events:none; filter: blur(52px); opacity:.45;
          background: radial-gradient(circle at 15% 20%, #8b5cf6 0, transparent 35%), radial-gradient(circle at 80% 20%, #00d4ff 0, transparent 35%); }
        .hero { border-radius:28px; border:1px solid rgba(255,255,255,.16); background:linear-gradient(135deg, rgba(30,24,70,.88), rgba(10,12,30,.92)); padding:1.3rem; margin-bottom:16px; }
        .hero-title { font-size:clamp(1.6rem,2.8vw,2.6rem); line-height:1.15; letter-spacing:-.024em; margin:.5rem 0; }
        .chip { display:inline-block; padding:.2rem .58rem; border:1px solid rgba(255,255,255,.24); border-radius:999px; font-size:.74rem; color:#d8ccff; margin-right:6px; }
        .sub { color:#cfd9f6; line-height:1.75; }
        .grid { display:grid; grid-template-columns: 1.08fr .92fr; gap:14px; }
        .glass { border-radius:18px; border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.04); backdrop-filter: blur(10px); padding:1rem; }
        .label { font-size:.82rem; color:#b6c7ff; font-weight:700; display:block; margin-bottom:4px; }
        .input { width:100%; background:#0c112a; border:1px solid rgba(148,163,184,.28); border-radius:12px; color:#eef4ff; padding:.68rem .8rem; }
        .three { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .primary { margin-top:14px; width:100%; background:linear-gradient(90deg,#8b5cf6,#6b7cff,#00d4ff); border:none; color:#fff; border-radius:12px; font-weight:800; padding:.78rem 1.2rem; }
        .result { white-space: pre-wrap; line-height:1.75; color:#eef4ff; }
        @media (max-width:980px){ .grid,.three{grid-template-columns:1fr;} }
      `}</style>

      <div className="halo" />
      <section className="hero">
        <div>
          <span className="chip">Press</span><span className="chip">Korean Tone</span><span className="chip">Fact-first</span>
          <h1 className="hero-title">과장 없이 신뢰되는 보도자료 초안, 빠르게 만들기</h1>
          <p className="sub">핵심 사실·수치·일정을 입력하면 바로 초안이 생성됩니다. 생성 후 사실관계만 확인하고 배포하세요.</p>
        </div>
      </section>

      <section className="grid">
        <div className="glass">
          <label className="label">담당부서</label>
          <input className="input" value={form.담당부서} onChange={(e)=>setForm(f=>({...f, 담당부서:e.target.value}))} placeholder="예: 4차산업추진국 AI반도체과" />
          <div className="three" style={{ marginTop: 10 }}>
            {[['소감주체','예: 성남시장 홍길동'],['담당자','예: 홍길동'],['연락처','예: 031-729-0000']].map(([k, ph]) => (
              <div key={k}>
                <label className="label">{k}</label>
                <input className="input" value={form[k as keyof typeof form]} onChange={(e)=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} />
              </div>
            ))}
          </div>
          <label className="label" style={{ marginTop: 10 }}>핵심 반영 내용</label>
          <textarea className="input" style={{ minHeight: 170, resize:'vertical' }} value={form.내용} onChange={(e)=>setForm(f=>({...f, 내용:e.target.value}))} placeholder="무엇을, 언제, 누구에게, 어떤 방식으로 제공하는지 입력" />
          <button className="primary" onClick={generate} disabled={loading}>{loading ? '생성 중...' : '보도자료 초안 생성'}</button>
        </div>

        <div className="glass">
          <div style={{ marginBottom: 10 }}>
            <div className="label">추천 제목</div>
            {titles.length ? titles.map((t, i) => <div key={i} style={{ marginBottom: 6 }}>{i+1}. {t}</div>) : <p className="sub" style={{ margin: 0 }}>생성 후 제목 후보가 표시됩니다.</p>}
          </div>
          <div className="label">초안 결과</div>
          {result ? <div className="result">{result.split('보도자료 추천 제목')[0] || result}</div> : <p className="sub" style={{ margin: 0 }}>결과가 여기에 표시됩니다.</p>}
        </div>
      </section>
    </div>
  );
}
