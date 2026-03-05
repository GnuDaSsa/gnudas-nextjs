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
        .press-wrap { color:#e5e7eb; }
        .hero {
          position: relative;
          padding: 1.1rem 1.1rem 1.25rem;
          border-radius: 20px;
          margin-bottom: 14px;
          background: linear-gradient(140deg, rgba(19,24,43,.96), rgba(15,18,29,.94));
          border: 1px solid rgba(255,255,255,.1);
          overflow: hidden;
        }
        .hero::after {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 180px;
          height: 180px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(99,102,241,.45) 0%, rgba(99,102,241,0) 70%);
          pointer-events: none;
        }
        .badge-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .badge {
          display:inline-flex; align-items:center; gap:6px;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.11);
          font-size: .74rem;
          color: #cbd5e1;
        }
        .dot { width:7px; height:7px; border-radius:50%; background:#34d399; box-shadow:0 0 12px rgba(52,211,153,.9); }
        .title {
          margin: .65rem 0 .45rem;
          font-size: clamp(1.55rem, 3vw, 2.15rem);
          letter-spacing: -.02em;
          line-height: 1.2;
          color: #f8fafc;
          font-weight: 750;
        }
        .sub {
          margin: 0;
          color: #9ca3af;
          line-height: 1.65;
          font-size: .95rem;
          max-width: 72ch;
        }
        .layout { display:grid; grid-template-columns: 1.06fr .94fr; gap: 14px; }
        .card {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.1);
          background: linear-gradient(180deg, rgba(17,20,30,.95), rgba(14,16,23,.95));
          padding: 1rem;
        }
        .label {
          display:block;
          font-size:.79rem;
          color:#9ca3af;
          margin-bottom:6px;
          font-weight:600;
        }
        .input {
          width:100%;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,.22);
          background: rgba(255,255,255,.02);
          color:#f3f4f6;
          padding: .7rem .78rem;
          font-size: .94rem;
          transition: border-color .15s ease, box-shadow .15s ease;
          outline: none;
        }
        .input:focus {
          border-color: rgba(99,102,241,.7);
          box-shadow: 0 0 0 3px rgba(99,102,241,.2);
        }
        .three { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top: 10px; }
        .btn {
          margin-top: 14px;
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: .78rem 1rem;
          font-weight: 700;
          font-size: .95rem;
          color: #fff;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          box-shadow: 0 10px 24px rgba(99,102,241,.28);
          cursor: pointer;
        }
        .btn:disabled { opacity:.6; cursor:not-allowed; }
        .sec-title { color:#cbd5e1; font-size:.8rem; margin:0 0 8px; text-transform: uppercase; letter-spacing:.06em; }
        .title-list { margin-bottom: 12px; }
        .title-item {
          padding: .56rem .6rem;
          border-radius: 10px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
          margin-bottom: 7px;
          color:#e2e8f0;
          font-size:.92rem;
        }
        .result {
          white-space: pre-wrap;
          line-height: 1.75;
          color: #f1f5f9;
          font-size: .95rem;
        }
        .empty {
          margin:0;
          color:#9ca3af;
          line-height:1.6;
          font-size:.92rem;
        }
        @media (max-width: 920px) {
          .layout, .three { grid-template-columns: 1fr; }
          .hero { padding: 1rem; }
          .card { border-radius: 14px; }
          .title { font-size: 1.75rem; }
        }
      `}</style>

      <div className="press-wrap">
        <section className="hero">
          <div className="badge-row">
            <span className="badge"><span className="dot" /> Live Draft</span>
            <span className="badge">Public Sector Tone</span>
            <span className="badge">Fact-first Writing</span>
          </div>
          <h1 className="title">보도자료 생성기</h1>
          <p className="sub">
            과장된 표현보다 사실관계 중심으로 초안을 만듭니다.
            담당부서·핵심 내용을 입력하면 바로 실무형 문장으로 정리됩니다.
          </p>
        </section>

        <section className="layout">
          <div className="card">
            <label className="label">담당부서</label>
            <input className="input" value={form.담당부서} onChange={(e)=>setForm((f)=>({...f, 담당부서:e.target.value}))} placeholder="예: 4차산업추진국 AI반도체과" />

            <div className="three">
              {[['소감주체', '예: 성남시장 홍길동'], ['담당자', '예: 홍길동'], ['연락처', '예: 031-729-0000']].map(([k, ph]) => (
                <div key={k}>
                  <label className="label">{k}</label>
                  <input className="input" value={form[k as keyof typeof form]} onChange={(e)=>setForm((f)=>({...f, [k]: e.target.value}))} placeholder={ph} />
                </div>
              ))}
            </div>

            <label className="label" style={{ marginTop: 10 }}>핵심 반영 내용</label>
            <textarea
              className="input"
              style={{ minHeight: 170, resize: 'vertical' }}
              value={form.내용}
              onChange={(e)=>setForm((f)=>({...f, 내용:e.target.value}))}
              placeholder="무엇을, 언제, 누구에게 제공하는지 구체적으로 입력"
            />

            <button className="btn" onClick={generate} disabled={loading}>
              {loading ? '생성 중...' : '보도자료 초안 생성'}
            </button>
          </div>

          <div className="card">
            <p className="sec-title">추천 제목</p>
            {titles.length > 0 ? (
              <div className="title-list">
                {titles.map((t, i) => (
                  <div key={i} className="title-item">{i + 1}. {t}</div>
                ))}
              </div>
            ) : (
              <p className="empty">생성 후 제목 후보가 이 영역에 표시됩니다.</p>
            )}

            <p className="sec-title" style={{ marginTop: 14 }}>초안 결과</p>
            {result ? (
              <div className="result">{result.split('보도자료 추천 제목')[0] || result}</div>
            ) : (
              <p className="empty">결과가 이 영역에 표시됩니다.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
