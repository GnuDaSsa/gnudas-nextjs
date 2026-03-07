'use client';
import { useState } from 'react';

const STYLES = [
  '사실적 (Photorealistic)',
  '시네마틱 (Cinematic)',
  '초현실적 (Surreal)',
  '애니메이션 (Anime)',
  '수채화 (Watercolor)',
  '유화 (Oil Painting)',
  '사이버펑크 (Cyberpunk)',
  '판타지 (Fantasy Art)',
  '미니멀 (Minimalist)',
  '빈티지 (Vintage Film)',
  '팝아트 (Pop Art)',
  '스케치 (Pencil Sketch)',
  '픽셀아트 (Pixel Art)',
  '3D 렌더 (3D Render)',
  '수묵화 (Ink Wash)',
];

const RATIOS = [
  { label: '숏폼용 (9:16)', value: '9:16' },
  { label: '롱폼용 (16:9)', value: '16:9' },
  { label: '정방형 (1:1)', value: '1:1' },
];

export default function ImgPromptPage() {
  const [input, setInput] = useState('');
  const [style, setStyle] = useState(STYLES[0]);
  const [ratio, setRatio] = useState('9:16');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [imageError, setImageError] = useState('');

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

  async function makePrompt() {
    if (!input.trim()) return;
    setLoadingPrompt(true);
    setGeneratedPrompt('');
    setImageDataUrl(null);
    setImageError('');
    try {
      const res = await fetch('/api/img-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, style, aspectRatio: ratio }),
      });
      const data = await res.json();
      setGeneratedPrompt(data.prompt || '');
    } finally {
      setLoadingPrompt(false);
    }
  }

  async function generateImage() {
    if (!generatedPrompt) return;
    if (!isAdmin && !apiKey.trim()) return;
    if (isAdmin && !adminPassword.trim()) return;
    setLoadingImage(true);
    setImageDataUrl(null);
    setImageError('');
    try {
      const body: Record<string, string> = { prompt: generatedPrompt, aspectRatio: ratio };
      if (isAdmin) body.adminPassword = adminPassword;
      else body.apiKey = apiKey;

      const res = await fetch('/api/img-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) setImageError(data.error);
      else setImageDataUrl(data.imageDataUrl || null);
    } finally {
      setLoadingImage(false);
    }
  }

  const promptJson = generatedPrompt
    ? JSON.stringify({ prompt: generatedPrompt }, null, 2)
    : '';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.4rem' }}>AI 이미지 생성기</h1>
      <p style={{ color: '#d5def3', marginBottom: '1.2rem', fontSize: '0.9rem' }}>한국어 설명을 영문 프롬프트로 변환한 뒤, 이미지를 생성합니다.</p>

      {/* STEP 1 */}
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
            <div style={{ display: 'flex', gap: 8 }}>
              {RATIOS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRatio(r.value)}
                  style={{
                    flex: 1,
                    background: ratio === r.value ? 'rgba(117,232,255,0.18)' : 'rgba(255,255,255,0.04)',
                    border: ratio === r.value ? '1px solid rgba(117,232,255,0.6)' : '1px solid rgba(125,187,255,0.2)',
                    borderRadius: 8,
                    color: ratio === r.value ? '#75e8ff' : '#8db9ff',
                    padding: '0.45rem 0.3rem',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: ratio === r.value ? 700 : 400,
                    textAlign: 'center',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          style={{ background: 'linear-gradient(90deg,#75e8ff,#8b5cf6)', color: '#fff', fontWeight: 800, border: 'none', borderRadius: 10, padding: '0.65rem 1.4rem', cursor: loadingPrompt ? 'not-allowed' : 'pointer', fontSize: '0.95rem', opacity: loadingPrompt ? 0.7 : 1, marginTop: 16, width: '100%' }}
          onClick={makePrompt}
          disabled={loadingPrompt}
        >
          {loadingPrompt ? '변환 중...' : '① 프롬프트 만들기'}
        </button>
      </div>

      {/* STEP 2 */}
      {generatedPrompt && (
        <>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 800, color: '#75e8ff', fontFamily: 'monospace', fontSize: '0.85rem' }}>prompt.json</div>
              <button onClick={() => copyText(promptJson)} style={{ background: 'rgba(117,232,255,0.15)', border: '1px solid rgba(117,232,255,0.3)', borderRadius: 6, color: '#75e8ff', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>복사</button>
            </div>
            <pre style={{
              margin: 0,
              padding: '0.9rem',
              background: 'rgba(0,0,0,0.35)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.07)',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              color: '#a8d8ff',
              lineHeight: 1.65,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
            }}>
              <span style={{ color: '#666' }}>{'{'}</span>{'\n'}
              <span style={{ color: '#666' }}>{'  '}</span>
              <span style={{ color: '#f97316' }}>&quot;prompt&quot;</span>
              <span style={{ color: '#888' }}>: </span>
              <span style={{ color: '#a8e6cf' }}>&quot;{generatedPrompt}&quot;</span>{'\n'}
              <span style={{ color: '#666' }}>{'}'}</span>
            </pre>
          </div>

          {/* API 키 입력 */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontWeight: 700, color: '#8db9ff', fontSize: '0.9rem' }}>
                {isAdmin ? '관리자 비밀번호' : 'Google AI API 키'}
              </label>
              <button
                onClick={() => { setIsAdmin(v => !v); setApiKey(''); setAdminPassword(''); }}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: isAdmin ? '#75e8ff' : '#555', padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
              >
                {isAdmin ? '관리자 모드 ✓' : '관리자'}
              </button>
            </div>
            <input
              type="password"
              style={inputStyle}
              placeholder={isAdmin ? '관리자 비밀번호 입력' : 'AIza...로 시작하는 Google AI API 키'}
              value={isAdmin ? adminPassword : apiKey}
              onChange={e => isAdmin ? setAdminPassword(e.target.value) : setApiKey(e.target.value)}
            />
            {!isAdmin && (
              <p style={{ fontSize: '0.78rem', color: '#445', marginTop: 6 }}>
                Google AI Studio에서 발급받은 API 키를 입력하세요. 키는 서버에 저장되지 않습니다.
              </p>
            )}
          </div>

          {imageError && (
            <div style={{ ...cardStyle, border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080', fontSize: '0.9rem' }}>
              {imageError}
            </div>
          )}

          <button
            style={{ background: 'linear-gradient(90deg,#f97316,#ec4899)', color: '#fff', fontWeight: 800, border: 'none', borderRadius: 10, padding: '0.65rem 1.4rem', cursor: loadingImage ? 'not-allowed' : 'pointer', fontSize: '0.95rem', opacity: loadingImage ? 0.7 : 1, marginBottom: '1rem', width: '100%' }}
            onClick={generateImage}
            disabled={loadingImage}
          >
            {loadingImage ? '이미지 생성 중...' : '② 이미지 생성하기'}
          </button>
        </>
      )}

      {imageDataUrl && (
        <div style={cardStyle}>
          <div style={{ fontWeight: 800, color: '#75e8ff', marginBottom: 10 }}>Generated Image</div>
          <img src={imageDataUrl} alt="생성된 이미지" style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      )}
    </div>
  );
}
