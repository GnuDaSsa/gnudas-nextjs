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

    setLoading(true);
    setResult('');
    setTitles([]);

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
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <style>{`
        .n-h1 { font-size:2.1rem; font-weight:700; letter-spacing:-.02em; margin:0 0 8px; color:#f9fafb; }
        .n-sub { color:#9ca3af; margin:0 0 24px; line-height:1.7; }
        .n-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .n-sec { border:1px solid rgba(255,255,255,.1); background:#111318; border-radius:12px; padding:20px; }
        .n-label { display:block; font-size:.83rem; color:#9ca3af; margin-bottom:6px; }
        .n-input { width:100%; border:1px solid rgba(255,255,255,.14); background:#0f1115; color:#f3f4f6; border-radius:8px; padding:.62rem .72rem; font-size:.93rem; }
        .n-three { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:10px; }
        .n-btn { margin-top:14px; width:100%; border:1px solid rgba(255,255,255,.18); background:#f3f4f6; color:#111827; border-radius:8px; padding:.62rem .98rem; font-weight:600; cursor:pointer; }
        .n-result { white-space:pre-wrap; line-height:1.75; color:#e5e7eb; }
        .n-muted { color:#9ca3af; }
        @media (max-width:900px){ .n-grid,.n-three{grid-template-columns:1fr;} .n-h1{font-size:1.7rem;} }
      `}</style>

      <h1 className="n-h1">보도자료 생성기</h1>
      <p className="n-sub">사실관계 중심 문장으로 초안을 생성합니다. 생성 후 수치와 고유명사를 한 번 더 확인해 배포하세요.</p>

      <div className="n-grid">
        <section className="n-sec">
          <label className="n-label">담당부서</label>
          <input className="n-input" value={form.담당부서} onChange={(e)=>setForm(f=>({...f, 담당부서:e.target.value}))} placeholder="예: 4차산업추진국 AI반도체과" />

          <div className="n-three">
            {[['소감주체','예: 성남시장 홍길동'],['담당자','예: 홍길동'],['연락처','예: 031-729-0000']].map(([k, ph]) => (
              <div key={k}>
                <label className="n-label">{k}</label>
                <input className="n-input" value={form[k as keyof typeof form]} onChange={(e)=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} />
              </div>
            ))}
          </div>

          <label className="n-label" style={{ marginTop: 10 }}>핵심 반영 내용</label>
          <textarea className="n-input" style={{ minHeight: 170, resize: 'vertical' }} value={form.내용} onChange={(e)=>setForm(f=>({...f, 내용:e.target.value}))} placeholder="무엇을, 언제, 누구에게 제공하는지 구체적으로 입력" />

          <button className="n-btn" onClick={generate} disabled={loading}>{loading ? '생성 중...' : '보도자료 초안 생성'}</button>
        </section>

        <section className="n-sec">
          <p className="n-muted" style={{ marginTop: 0 }}>추천 제목</p>
          {titles.length ? titles.map((t, i) => <div key={i} style={{ marginBottom: 6, color: '#e5e7eb' }}>{i+1}. {t}</div>) : <p className="n-muted">생성 후 제목 후보가 표시됩니다.</p>}

          <p className="n-muted" style={{ marginTop: 16 }}>초안 결과</p>
          {result ? <div className="n-result">{result.split('보도자료 추천 제목')[0] || result}</div> : <p className="n-muted">결과가 이 영역에 표시됩니다.</p>}
        </section>
      </div>
    </div>
  );
}
