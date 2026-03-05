'use client';
import { useState } from 'react';

export default function PressPage() {
  const [form, setForm] = useState({ 담당부서: '', 소감주체: '', 담당자: '', 연락처: '', 내용: '' });
  const [result, setResult] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  async function generate() {
    if (!form.담당부서 || !form.내용 || !form.담당자 || !form.연락처) {
      alert('필수 항목(담당부서/담당자/연락처/핵심내용)을 입력해 주세요.');
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
      setCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .page-wrap { max-width: 1200px; margin: 0 auto; color: #eef4ff; }
        .hero { display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px; margin-bottom: 20px; }
        .card { border: 1px solid rgba(125,187,255,0.22); background: rgba(8,10,34,0.55); border-radius: 16px; padding: 1.2rem; }
        .eyebrow { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #84c7ff; margin-bottom: 8px; }
        .title { font-size: 2rem; line-height: 1.25; letter-spacing: -0.02em; margin: 0 0 .6rem; }
        .sub { color: #c8d5ef; line-height: 1.7; font-size: 1.02rem; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .three { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 12px; }
        .label { font-size: 0.84rem; font-weight: 700; color: #9cc8ff; display: block; margin-bottom: 4px; }
        .input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(125,187,255,0.26); border-radius: 10px; color: #eef4ff; padding: .62rem .78rem; font-size: .95rem; outline: none; }
        .textarea { min-height: 160px; resize: vertical; }
        .primary { margin-top: 16px; background: #6b7cff; color: white; font-weight: 800; border: none; border-radius: 11px; padding: .72rem 1.4rem; cursor: pointer; font-size: .95rem; width: 100%; }
        .result-box { white-space: pre-wrap; color: #eef4ff; line-height: 1.75; }
        .title-list div { margin-bottom: 6px; color: #d7e4ff; }
        @media (max-width: 980px) {
          .hero, .grid { grid-template-columns: 1fr; }
          .three { grid-template-columns: 1fr; }
          .title { font-size: 1.6rem; }
        }
      `}</style>

      <div className="page-wrap">
        <section className="hero">
          <div className="card">
            <div className="eyebrow">Press Assistant</div>
            <h1 className="title">보도자료 초안을, 실무 문장 톤으로 빠르게 생성</h1>
            <p className="sub">
              과장된 표현보다 근거 중심 문장으로 정리합니다.
              담당부서/핵심 내용 입력 후 초안을 확인하고 필요한 부분만 손보세요.
            </p>
          </div>
          <div className="card">
            <div className="eyebrow">오늘 처리량</div>
            <p className="sub" style={{ marginTop: 0 }}>
              오늘 생성 횟수: <strong style={{ color: '#ffffff' }}>{count}</strong><br />
              권장 입력: 사실관계/수치/일정/문의처
            </p>
          </div>
        </section>

        <section className="grid">
          <div className="card">
            <div className="eyebrow">입력</div>
            <label className="label">담당부서</label>
            <input
              className="input"
              placeholder="예: 4차산업추진국 AI반도체과"
              value={form.담당부서}
              onChange={(e) => setForm((f) => ({ ...f, 담당부서: e.target.value }))}
            />

            <div className="three">
              {[['소감주체', '예: 성남시장 홍길동'], ['담당자', '예: 홍길동'], ['연락처', '예: 031-729-0000']].map(([k, ph]) => (
                <div key={k}>
                  <label className="label">{k}</label>
                  <input
                    className="input"
                    placeholder={ph}
                    value={form[k as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <label className="label" style={{ marginTop: 12 }}>핵심 반영 내용</label>
            <textarea
              className="input textarea"
              placeholder="무엇을, 언제, 누구에게, 어떤 방식으로 제공하는지 구체적으로 입력해 주세요."
              value={form.내용}
              onChange={(e) => setForm((f) => ({ ...f, 내용: e.target.value }))}
            />

            <button className="primary" onClick={generate} disabled={loading}>
              {loading ? '초안 생성 중...' : '3분 안에 보도자료 초안 받기'}
            </button>
          </div>

          <div className="card">
            <div className="eyebrow">결과</div>
            {titles.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 800, color: '#8cc7ff', marginBottom: 8 }}>추천 제목</div>
                <div className="title-list">
                  {titles.map((t, i) => (
                    <div key={i}>{i + 1}. {t}</div>
                  ))}
                </div>
              </div>
            )}

            {result ? (
              <div className="result-box">{result.split('보도자료 추천 제목')[0] || result}</div>
            ) : (
              <p className="sub" style={{ marginTop: 0 }}>
                결과는 이 영역에 표시됩니다.
                생성 후 사실관계와 수치를 한 번 더 확인해 배포하세요.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
