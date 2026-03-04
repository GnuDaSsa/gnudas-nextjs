'use client';
import { useState } from 'react';

export default function ChecklistPage() {
  const [teamLeader, setTeamLeader] = useState('');
  const [manager, setManager] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; downloadUrl: string } | null>(null);
  const [error, setError] = useState('');

  const cardStyle = {
    borderRadius: 14,
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
  const labelStyle = { fontSize: '0.85rem', fontWeight: 700, color: '#8db9ff', display: 'block', marginBottom: 2 };
  const btnStyle = {
    background: 'linear-gradient(90deg,#75e8ff,#8b5cf6)',
    color: '#fff', fontWeight: 800, border: 'none',
    borderRadius: 10, padding: '0.65rem 1.4rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '0.95rem', opacity: loading ? 0.7 : 1,
  };

  async function generate() {
    if (!teamLeader || !manager) { setError('팀장님과 과장님 성함을 모두 입력하세요.'); return; }
    if (!file) { setError('엑셀 파일을 업로드하세요.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('teamLeader', teamLeader);
      formData.append('manager', manager);
      const res = await fetch('/api/checklist', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '오류가 발생했습니다.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const count = parseInt(res.headers.get('X-Record-Count') || '0');
      setResult({ count, downloadUrl: url });
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.4rem' }}>📋 도급위탁용역 점검표 생성기</h1>
      <p style={{ color: '#d5def3', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
        엑셀 파일에서 데이터를 추출하여 ODT 점검표를 생성합니다.
      </p>

      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>팀장님 성함</label>
            <input style={inputStyle} maxLength={10} placeholder="팀장 성함" value={teamLeader} onChange={e => setTeamLeader(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>과장님 성함</label>
            <input style={inputStyle} maxLength={10} placeholder="과장 성함" value={manager} onChange={e => setManager(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>엑셀 파일 업로드 (.xlsx)</label>
          <input
            type="file"
            accept=".xlsx"
            style={{ color: '#eef4ff', marginTop: 4 }}
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {error && (
          <div style={{ marginTop: 10, padding: '0.6rem 0.9rem', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button style={{ ...btnStyle, marginTop: 16 }} onClick={generate} disabled={loading}>
          {loading ? '생성 중...' : '생성'}
        </button>
      </div>

      {result && (
        <div style={{ ...cardStyle, border: '1px solid rgba(52,211,153,0.4)' }}>
          <div style={{ fontWeight: 800, color: '#34d399', marginBottom: 8 }}>✅ 생성 완료</div>
          <div style={{ color: '#d5def3', fontSize: '0.9rem', marginBottom: 12 }}>
            {result.count}개의 점검표가 생성되었습니다.
          </div>
          <a
            href={result.downloadUrl}
            download="점검표_결과.zip"
            style={{ ...btnStyle, display: 'inline-block', textDecoration: 'none', cursor: 'pointer' } as React.CSSProperties}
          >
            📥 ZIP 다운로드
          </a>
        </div>
      )}

      <div style={{ ...cardStyle, background: 'rgba(117,232,255,0.05)', border: '1px solid rgba(117,232,255,0.2)' }}>
        <div style={{ fontWeight: 700, color: '#75e8ff', marginBottom: 8 }}>📌 사용 안내</div>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#d5def3', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <li>엑셀 파일에 <strong>점검표1, 점검표2, 점검표3</strong> 시트가 있어야 합니다.</li>
          <li>빨간색 폰트로 표시된 행의 데이터를 추출합니다.</li>
          <li>ODT 템플릿 파일이 서버에 미리 업로드되어 있어야 합니다.</li>
        </ul>
      </div>
    </div>
  );
}
