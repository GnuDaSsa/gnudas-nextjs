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
    if (!teamLeader || !manager) {
      setError('팀장님과 과장님 성함을 모두 입력해 주세요.');
      return;
    }
    if (!file) {
      setError('엑셀(.xlsx) 파일을 업로드해 주세요.');
      return;
    }

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
        setError(data.error || '점검표 생성 중 오류가 발생했습니다.');
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
    <>
      <style>{`
        .page-wrap { max-width: 1040px; margin: 0 auto; color: #eef4ff; }
        .hero { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; margin-bottom: 20px; }
        .card { border: 1px solid rgba(125,187,255,0.22); background: rgba(8,10,34,0.55); border-radius: 16px; padding: 1.2rem; }
        .eyebrow { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #84c7ff; margin-bottom: 8px; }
        .title { font-size: 2rem; line-height: 1.25; letter-spacing: -0.02em; margin: 0 0 .6rem; }
        .sub { color: #c8d5ef; line-height: 1.7; font-size: 1.02rem; }
        .proof { display: grid; gap: 10px; }
        .proof-item { padding: .75rem .8rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,.08); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .label { font-size: 0.84rem; font-weight: 700; color: #9cc8ff; display: block; margin-bottom: 4px; }
        .input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(125,187,255,0.26); border-radius: 10px; color: #eef4ff; padding: .62rem .78rem; font-size: .95rem; outline: none; }
        .input-file { margin-top: 6px; color: #c8d5ef; }
        .primary { margin-top: 16px; background: #6b7cff; color: white; font-weight: 800; border: none; border-radius: 11px; padding: .72rem 1.4rem; cursor: pointer; font-size: .95rem; }
        .error { margin-top: 12px; padding: .68rem .85rem; border-radius: 9px; background: rgba(239,68,68,.16); border: 1px solid rgba(239,68,68,.42); color: #ffb4b4; }
        .hint-list { margin: 0; padding-left: 1.1rem; color: #d5def3; line-height: 1.8; }
        @media (max-width: 920px) {
          .hero { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
          .title { font-size: 1.6rem; }
        }
      `}</style>

      <div className="page-wrap">
        <section className="hero">
          <div className="card">
            <div className="eyebrow">Checklist Generator</div>
            <h1 className="title">엑셀 업로드 후, 점검표 ZIP까지 한 번에 생성</h1>
            <p className="sub">
              반복 입력 대신 필요한 정보만 넣고 바로 내려받으세요.
              일반적으로 1~2분 내 결과를 확인할 수 있습니다.
            </p>
          </div>

          <div className="card proof">
            <div className="proof-item"><strong>대상</strong><br />점검표 작성이 자주 필요한 운영/실무 담당자</div>
            <div className="proof-item"><strong>준비물</strong><br />.xlsx 파일 + 팀장/과장 성함</div>
            <div className="proof-item"><strong>결과물</strong><br />ODT 점검표 ZIP 파일</div>
          </div>
        </section>

        <section className="card" style={{ marginBottom: 14 }}>
          <div className="eyebrow">Step 1 · 정보 입력</div>
          <div className="form-grid">
            <div>
              <label className="label">팀장님 성함</label>
              <input className="input" maxLength={10} placeholder="예: 홍길동" value={teamLeader} onChange={(e) => setTeamLeader(e.target.value)} />
            </div>
            <div>
              <label className="label">과장님 성함</label>
              <input className="input" maxLength={10} placeholder="예: 김영희" value={manager} onChange={(e) => setManager(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="label">Step 2 · 엑셀 파일 업로드 (.xlsx)</label>
            <input
              type="file"
              accept=".xlsx"
              className="input-file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button className="primary" onClick={generate} disabled={loading}>
            {loading ? '생성 중...' : '3분 안에 점검표 만들기'}
          </button>
        </section>

        {result && (
          <section className="card" style={{ borderColor: 'rgba(52,211,153,0.5)', marginBottom: 14 }}>
            <div className="eyebrow" style={{ color: '#6ee7b7' }}>생성 완료</div>
            <p className="sub" style={{ marginTop: 0 }}>{result.count}개의 점검표를 만들었습니다. 바로 다운로드해 확인해 주세요.</p>
            <a href={result.downloadUrl} download="점검표_결과.zip" className="primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              ZIP 파일 다운로드
            </a>
          </section>
        )}

        <section className="card">
          <div className="eyebrow">사용 전 확인</div>
          <ul className="hint-list">
            <li>엑셀 파일에 <strong>점검표1, 점검표2, 점검표3</strong> 시트가 있어야 합니다.</li>
            <li>빨간색 폰트로 표시된 행의 데이터를 추출합니다.</li>
            <li>ODT 템플릿 파일이 서버에 미리 업로드되어 있어야 합니다.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
