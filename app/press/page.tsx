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
      alert('모든 필드를 입력해주세요.'); return;
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
      // 추천 제목 파싱
      const titleMatches = full.match(/'([^']+)'/g);
      if (titleMatches) setTitles(titleMatches.slice(0, 5).map(t => t.replace(/'/g, '')));
      setCount(c => c + 1);
    } finally {
      setLoading(false);
    }
  }

  const cardStyle = {
    borderRadius: 16,
    border: '1px solid rgba(125,187,255,0.3)',
    background: 'rgba(8,10,34,0.6)',
    padding: '1.2rem',
    marginBottom: '1rem',
  };
  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(125,187,255,0.3)',
    borderRadius: 8,
    color: '#eef4ff',
    padding: '0.5rem 0.75rem',
    fontSize: '0.95rem',
    outline: 'none',
    marginTop: 4,
  };
  const labelStyle = { fontSize: '0.9rem', fontWeight: 700, color: '#8db9ff', display: 'block', marginBottom: 2 };
  const btnStyle = {
    background: 'linear-gradient(90deg,#75e8ff,#8b5cf6)',
    color: '#fff',
    fontWeight: 800,
    border: 'none',
    borderRadius: 10,
    padding: '0.65rem 1.4rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '0.95rem',
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.4rem' }}>
        성남시 생성형 AI 보도자료 생성기
      </h1>
      <p style={{ color: '#d5def3', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
        ChatGPT-4o 기반 · 오늘 {count}회 생성
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
        {/* 입력 폼 */}
        <div style={cardStyle}>
          <label style={labelStyle}>1. 담당부서</label>
          <input style={inputStyle} placeholder="4차산업추진국 AI반도체과"
            value={form.담당부서} onChange={e => setForm(f => ({...f, 담당부서: e.target.value}))} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            {[['소감주체','성남시장 OOO'],['담당자','홍길동'],['연락처','031-729-0000']].map(([k,ph]) => (
              <div key={k}>
                <label style={labelStyle}>{k}</label>
                <input style={inputStyle} placeholder={ph}
                  value={form[k as keyof typeof form]}
                  onChange={e => setForm(f => ({...f, [k]: e.target.value}))} />
              </div>
            ))}
          </div>

          <label style={{ ...labelStyle, marginTop: 12 }}>5. 보도자료 핵심반영 내용</label>
          <textarea
            style={{ ...inputStyle, height: 140, resize: 'vertical' }}
            placeholder="물놀이장 이용은 초등학생 이하로..."
            value={form.내용}
            onChange={e => setForm(f => ({...f, 내용: e.target.value}))}
          />

          <button style={{ ...btnStyle, marginTop: 16, width: '100%' }} onClick={generate} disabled={loading}>
            {loading ? '생성 중...' : '보도자료 생성'}
          </button>
        </div>

        {/* 결과 */}
        <div style={cardStyle}>
          {titles.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 800, color: '#75e8ff', marginBottom: 8 }}>AI 추천 보도자료 제목 5개:</div>
              {titles.map((t, i) => <div key={i} style={{ color: '#d5def3', marginBottom: 4 }}>{i+1}. {t}</div>)}
            </div>
          )}
          {result ? (
            <div style={{ color: '#eef4ff', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {result.split('보도자료 추천 제목')[0] || result}
            </div>
          ) : (
            <div style={{ color: '#8db9ff', fontSize: '0.9rem' }}>
              보도자료를 생성하면 이곳에 결과가 표시됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
