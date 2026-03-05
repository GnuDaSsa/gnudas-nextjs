'use client';
import { useState } from 'react';

const STYLES = ['사실적 (Photorealistic)', '시네마틱 (Cinematic)', '초현실적 (Surreal)', '애니메이션 (Anime)', '수채화 (Watercolor)'];
const RATIOS = ['1:1', '16:9', '4:3', '3:4', '9:16'];

type Result = {
  positive: string;
  negative: string;
  imageDataUrl: string | null;
};

export default function ImgPromptPage() {
  const [input, setInput] = useState('');
  const [style, setStyle] = useState(STYLES[0]);
  const [ratio, setRatio] = useState(RATIOS[0]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function convertAndGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/img-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, style, aspectRatio: ratio }),
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
  } as const;

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(125,187,255,0.3)',
    borderRadius: 8,
    color: '#eef4ff',
    padding: '0.5rem 0.75rem',
    fontSize: '0.95rem',
    outline: 'none',
  } as const;

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.4rem' }}>AI 이미지 생성기</h1>
      <p style={{ color: '#d5def3', marginBottom: '1.2rem', fontSize: '0.9rem' }}>한국어 설명을 프롬프트로 변환하고, Google 이미지 모델로 바로 생성합니다.</p>

      <div style={cardStyle}>
        <label style={{ fontWeight: 700, color: '#8db9ff', fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>원하는 이미지 설명 (한국어)</label>
        <textarea
          style={{ ...inputStyle, height: 100, resize: 'vertical' }}
          placeholder="예: 밤하늘 아래 벚꽃이 피어있는 일본 거리, 사람들이 걸어다니고 있음"
          value={input}
          onChange={e => setInput(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div>
            <label style={{ fontWeight: 700, color: '#8db9ff', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>스타일</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={style} onChange={e => setStyle(e.target.value)}>
              {STYLES.map(s => <option key={s} value={s} style={{ background: '#0c1242' }}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 700, color: '#8db9ff', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>비율</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={ratio} onChange={e => setRatio(e.target.value)}>
              {RATIOS.map(r => <option key={r} value={r} style={{ background: '#0c1242' }}>{r}</option>)}
            </select>
          </div>
        </div>

        <button
          style={{
            background: 'linear-gradient(90deg,#75e8ff,#8b5cf6)',
            color: '#fff',
            fontWeight: 800,
            border: 'none',
            borderRadius: 10,
            padding: '0.65rem 1.4rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            opacity: loading ? 0.7 : 1,
            marginTop: 16,
            width: '100%',
          }}
          onClick={convertAndGenerate}
          disabled={loading}
        >
          {loading ? '생성 중...' : '프롬프트 변환 + 이미지 생성'}
        </button>
      </div>

      {result?.imageDataUrl && (
        <div style={cardStyle}>
          <div style={{ fontWeight: 800, color: '#75e8ff', marginBottom: 10 }}>Generated Image</div>
          <img src={result.imageDataUrl} alt="생성된 이미지" style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      )}

      {result && (
        <>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 800, color: '#75e8ff' }}>Positive Prompt</div>
              <button onClick={() => copyText(result.positive)} style={{ background: 'rgba(117,232,255,0.15)', border: '1px solid rgba(117,232,255,0.3)', borderRadius: 6, color: '#75e8ff', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>복사</button>
            </div>
            <div style={{ color: '#eef4ff', fontSize: '0.9rem', lineHeight: 1.6, wordBreak: 'break-word' }}>{result.positive}</div>
          </div>
          {result.negative && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 800, color: '#ff77e6' }}>Negative Prompt</div>
                <button onClick={() => copyText(result.negative)} style={{ background: 'rgba(255,119,230,0.15)', border: '1px solid rgba(255,119,230,0.3)', borderRadius: 6, color: '#ff77e6', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>복사</button>
              </div>
              <div style={{ color: '#eef4ff', fontSize: '0.9rem', lineHeight: 1.6, wordBreak: 'break-word' }}>{result.negative}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
