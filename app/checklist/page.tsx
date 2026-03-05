'use client';
import { useState } from 'react';

export default function ChecklistPage() {
  const [teamLeader, setTeamLeader] = useState('');
  const [manager, setManager] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; downloadUrl: string } | null>(null);
  const [error, setError] = useState('');

  async function generate() {
    if (!teamLeader || !manager) return setError('팀장님/과장님 성함을 입력해 주세요.');
    if (!file) return setError('엑셀(.xlsx) 파일을 업로드해 주세요.');

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('teamLeader', teamLeader);
      formData.append('manager', manager);
      const res = await fetch('/api/checklist', { method: 'POST', body: formData });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '생성 중 오류가 발생했습니다.');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const count = parseInt(res.headers.get('X-Record-Count') || '0', 10);
      setResult({ count, downloadUrl: url });
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <style>{`
        .n-wrap { color:#e5e7eb; }
        .n-h1 { font-size:2.1rem; font-weight:700; letter-spacing:-.02em; margin:0 0 8px; color:#f9fafb; }
        .n-sub { color:#9ca3af; margin:0 0 24px; line-height:1.7; }
        .n-section { border:1px solid rgba(255,255,255,.1); background:#111318; border-radius:12px; padding:20px; margin-bottom:14px; }
        .n-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .n-label { display:block; font-size:.83rem; color:#9ca3af; margin-bottom:6px; }
        .n-input { width:100%; border:1px solid rgba(255,255,255,.14); background:#0f1115; color:#f3f4f6; border-radius:8px; padding:.62rem .72rem; font-size:.93rem; }
        .n-btn { margin-top:14px; border:1px solid rgba(255,255,255,.18); background:#f3f4f6; color:#111827; border-radius:8px; padding:.62rem .98rem; font-weight:600; cursor:pointer; }
        .n-btn:disabled { opacity:.6; cursor:not-allowed; }
        .n-muted { color:#9ca3af; font-size:.9rem; }
        .n-err { margin-top:10px; background:rgba(127,29,29,.3); border:1px solid rgba(239,68,68,.4); color:#fca5a5; border-radius:8px; padding:.62rem .72rem; }
        .n-ok { border-color:rgba(16,185,129,.4); }
        .n-list { margin:0; padding-left:18px; color:#d1d5db; line-height:1.8; }
        @media (max-width:780px){ .n-grid { grid-template-columns:1fr; } .n-h1{font-size:1.7rem;} }
      `}</style>

      <div className="n-wrap">
        <h1 className="n-h1">도급위탁용역 점검표 생성기</h1>
        <p className="n-sub">필요한 정보만 입력하면 점검표 ZIP을 바로 생성합니다. 복잡한 단계 없이 실무 중심으로 설계했습니다.</p>

        <section className="n-section">
          <div className="n-grid">
            <div>
              <label className="n-label">팀장님 성함</label>
              <input className="n-input" maxLength={10} value={teamLeader} onChange={(e) => setTeamLeader(e.target.value)} placeholder="예: 홍길동" />
            </div>
            <div>
              <label className="n-label">과장님 성함</label>
              <input className="n-input" maxLength={10} value={manager} onChange={(e) => setManager(e.target.value)} placeholder="예: 김영희" />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="n-label">엑셀 파일 업로드 (.xlsx)</label>
            <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          {error && <div className="n-err">{error}</div>}

          <button className="n-btn" onClick={generate} disabled={loading}>
            {loading ? '생성 중...' : '점검표 생성'}
          </button>
        </section>

        {result && (
          <section className="n-section n-ok">
            <p style={{ marginTop: 0 }}><strong>{result.count}개</strong> 점검표 생성이 완료됐습니다.</p>
            <a className="n-btn" style={{ display: 'inline-block', textDecoration: 'none' }} href={result.downloadUrl} download="점검표_결과.zip">
              ZIP 다운로드
            </a>
          </section>
        )}

        <section className="n-section">
          <p className="n-muted" style={{ marginTop: 0, marginBottom: 8 }}>사용 전 확인 사항</p>
          <ul className="n-list">
            <li>엑셀 파일에 <strong>점검표1, 점검표2, 점검표3</strong> 시트가 있어야 합니다.</li>
            <li>빨간색 폰트로 표시된 행의 데이터를 추출합니다.</li>
            <li>ODT 템플릿 파일이 서버에 미리 업로드되어 있어야 합니다.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
