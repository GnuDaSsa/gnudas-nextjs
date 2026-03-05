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
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <style>{`
        .wrap { color:#e5e7eb; }
        .hero {
          padding: 6px 0 20px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          margin-bottom: 18px;
        }
        .eyebrow {
          font-size: .74rem;
          color: #94a3b8;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .title {
          margin: 0;
          font-size: clamp(1.65rem, 3vw, 2.35rem);
          line-height: 1.18;
          letter-spacing: -.022em;
          color: #f8fafc;
          font-weight: 760;
        }
        .sub {
          margin: 12px 0 0;
          color: #9ca3af;
          line-height: 1.7;
          font-size: .98rem;
          max-width: 68ch;
        }

        .form {
          display: grid;
          gap: 14px;
          margin-bottom: 18px;
        }
        .field {
          display: grid;
          gap: 6px;
        }
        .label {
          font-size: .82rem;
          color: #a1a1aa;
          font-weight: 600;
        }
        .input {
          width: 100%;
          border: 0;
          border-bottom: 1px solid rgba(148,163,184,.35);
          background: transparent;
          color: #f3f4f6;
          padding: .66rem .1rem;
          font-size: 1.02rem;
          outline: none;
          transition: border-color .15s ease;
        }
        .input:focus {
          border-bottom-color: #818cf8;
        }

        .file-row {
          padding-top: 8px;
        }
        .file-hint {
          margin-top: 6px;
          font-size: .82rem;
          color: #71717a;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }
        .btn {
          border: none;
          border-radius: 999px;
          padding: .72rem 1.25rem;
          font-weight: 700;
          font-size: .95rem;
          color: #fff;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          box-shadow: 0 8px 20px rgba(99,102,241,.25);
          cursor: pointer;
        }
        .btn:disabled { opacity:.62; cursor:not-allowed; }

        .error {
          margin-top: 6px;
          font-size: .88rem;
          color: #fca5a5;
        }

        .result {
          margin-top: 10px;
          padding-top: 14px;
          border-top: 1px dashed rgba(255,255,255,.14);
        }
        .result p {
          margin: 0 0 10px;
          color: #d1fae5;
        }
        .download {
          color: #c7d2fe;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .notes {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.08);
        }
        .notes-title {
          margin: 0 0 8px;
          color: #a1a1aa;
          font-size: .85rem;
          text-transform: uppercase;
          letter-spacing: .06em;
        }
        .notes ul {
          margin: 0;
          padding-left: 18px;
          color: #9ca3af;
          line-height: 1.75;
          font-size: .94rem;
        }
      `}</style>

      <div className="wrap">
        <section className="hero">
          <div className="eyebrow">Checklist Workflow</div>
          <h1 className="title">도급위탁용역 점검표 생성기</h1>
          <p className="sub">필요한 정보만 입력하면 점검표 ZIP을 바로 생성합니다. 복잡한 화면 대신, 실무에서 바로 쓰기 좋게 단순하게 구성했습니다.</p>
        </section>

        <section className="form">
          <div className="field">
            <label className="label">팀장님 성함</label>
            <input className="input" maxLength={10} value={teamLeader} onChange={(e) => setTeamLeader(e.target.value)} placeholder="예: 홍길동" />
          </div>

          <div className="field">
            <label className="label">과장님 성함</label>
            <input className="input" maxLength={10} value={manager} onChange={(e) => setManager(e.target.value)} placeholder="예: 김영희" />
          </div>

          <div className="file-row">
            <label className="label">엑셀 파일 업로드 (.xlsx)</label>
            <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="file-hint">점검표1/2/3 시트가 있는 파일을 업로드해 주세요.</div>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button className="btn" onClick={generate} disabled={loading}>{loading ? '생성 중...' : '점검표 생성'}</button>
          </div>

          {result && (
            <div className="result">
              <p><strong>{result.count}개</strong> 점검표 생성이 완료됐습니다.</p>
              <a className="download" href={result.downloadUrl} download="점검표_결과.zip">ZIP 다운로드</a>
            </div>
          )}
        </section>

        <section className="notes">
          <p className="notes-title">사용 전 확인 사항</p>
          <ul>
            <li>엑셀 파일에 <strong>점검표1, 점검표2, 점검표3</strong> 시트가 있어야 합니다.</li>
            <li>빨간색 폰트로 표시된 행의 데이터를 추출합니다.</li>
            <li>ODT 템플릿 파일이 서버에 미리 업로드되어 있어야 합니다.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
