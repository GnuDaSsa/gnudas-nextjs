'use client';
import { useState } from 'react';

export default function LawPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{laws: any[], precedents: any[], analysis: string} | null>(null);
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
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  const cardStyle = {
    borderRadius: 14,
    border: '1px solid rgba(125,187,255,0.3)',
    background: 'rgba(8,10,34,0.6)',
    padding: '1.2rem',
    marginBottom: '1rem',
  };
  const inputStyle = {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(125,187,255,0.3)',
    borderRadius: 8,
    color: '#eef4ff',
    padding: '0.6rem 0.9rem',
    fontSize: '1rem',
    outline: 'none',
  };
  const btnStyle = {
    background: 'linear-gradient(90deg,#75e8ff,#8b5cf6)',
    color: '#fff',
    fontWeight: 800,
    border: 'none',
    borderRadius: 10,
    padding: '0.6rem 1.4rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '0.95rem',
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.4rem' }}>⚖️ AI 법률 검색</h1>
      <p style={{ color: '#d5def3', marginBottom: '1.2rem', fontSize: '0.9rem' }}>법령 및 판례를 검색하고 AI가 분석합니다.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem' }}>
        <input
          style={inputStyle}
          placeholder="검색어를 입력하세요 (예: 근로기준법, 임금체불)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <button style={btnStyle} onClick={search} disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: '#8db9ff', padding: '2rem' }}>
          법률 정보를 검색하고 AI가 분석 중입니다...
        </div>
      )}

      {result && (
        <>
          {/* AI 분석 */}
          <div style={cardStyle}>
            <div style={{ fontWeight: 800, color: '#75e8ff', marginBottom: 12 }}>🤖 AI 법률 분석</div>
            <div style={{ color: '#eef4ff', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
              {result.analysis}
            </div>
          </div>

          {/* 법령 목록 */}
          {result.laws?.length > 0 && (
            <div style={cardStyle}>
              <div style={{ fontWeight: 800, color: '#75e8ff', marginBottom: 12 }}>📚 관련 법령</div>
              {result.laws.map((law: any, i: number) => (
                <div key={i} style={{ padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: 700, color: '#eef4ff' }}>{law.법령명}</div>
                  <div style={{ color: '#8db9ff', fontSize: '0.85rem', marginTop: 2 }}>{law.법령종류} · {law.시행일자}</div>
                </div>
              ))}
            </div>
          )}

          {/* 판례 목록 */}
          {result.precedents?.length > 0 && (
            <div style={cardStyle}>
              <div style={{ fontWeight: 800, color: '#75e8ff', marginBottom: 12 }}>⚖️ 관련 판례</div>
              {result.precedents.map((prec: any, i: number) => (
                <div key={i} style={{ padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: 700, color: '#eef4ff' }}>{prec.판례명 || prec.사건명}</div>
                  <div style={{ color: '#8db9ff', fontSize: '0.85rem', marginTop: 2 }}>{prec.선고일자} · {prec.법원명}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
