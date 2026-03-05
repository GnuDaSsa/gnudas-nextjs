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
    <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative' }}>
      <style>{`
        .mesh { position:absolute; inset:-40px -20px auto; height:280px; pointer-events:none; filter: blur(44px); opacity:.45;
          background: radial-gradient(circle at 20% 30%, #6b7cff 0, transparent 40%), radial-gradient(circle at 80% 20%, #00d4ff 0, transparent 35%), radial-gradient(circle at 60% 80%, #a855f7 0, transparent 40%); }
        .hero-wrap { position:relative; border-radius: 28px; overflow: hidden; border:1px solid rgba(255,255,255,.16); padding:1.4rem; background: linear-gradient(135deg, rgba(20,24,58,.88), rgba(10,12,30,.92)); margin-bottom:18px; }
        .chip { display:inline-block; padding:.22rem .6rem; border-radius:999px; border:1px solid rgba(117,232,255,.35); color:#9de9ff; font-size:.75rem; margin-right:6px; }
        .hero-title { font-size: clamp(1.6rem, 2.8vw, 2.7rem); line-height:1.15; letter-spacing:-.025em; margin:.55rem 0 .7rem; font-weight:800; }
        .hero-grid { display:grid; grid-template-columns: 1.35fr .85fr; gap:14px; }
        .glass { border-radius: 18px; border:1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.04); backdrop-filter: blur(10px); padding:1rem; }
        .kpi { font-size:.86rem; color:#b8c9ee; }
        .kpi strong { color:#fff; }
        .grid { display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
        .label { font-size:.82rem; color:#9dc4ff; font-weight:700; display:block; margin-bottom:4px; }
        .input { width:100%; background:#0c112a; border:1px solid rgba(148,163,184,.25); border-radius:12px; color:#eef4ff; padding:.68rem .8rem; }
        .primary { background: linear-gradient(90deg,#6b7cff,#8b5cf6,#00d4ff); background-size: 200% 100%; color:#fff; border:none; border-radius:12px; font-weight:800; padding:.78rem 1.2rem; margin-top:14px; cursor:pointer; animation: pulsegrad 4s linear infinite; }
        @keyframes pulsegrad { 0% {background-position:0%} 100% {background-position:200%} }
        .error { margin-top:10px; color:#ffb9b9; background:rgba(239,68,68,.16); border:1px solid rgba(239,68,68,.4); border-radius:10px; padding:.62rem .78rem; }
        .soft { color:#c9d7f3; line-height:1.7; }
        @media (max-width: 920px){ .hero-grid, .grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="mesh" />

      <section className="hero-wrap">
        <div>
          <span className="chip">Ops Tool</span>
          <span className="chip">ODT Export</span>
          <span className="chip">Fast Workflow</span>
        </div>
        <div className="hero-grid">
          <div>
            <h1 className="hero-title">점검표 생성 작업, 입력 2개 + 업로드 1번으로 끝내기</h1>
            <p className="soft">반복 작성 시간을 줄이고 결과 ZIP을 바로 받습니다. 일반적으로 1~3분 내 확인할 수 있습니다.</p>
          </div>
          <div className="glass">
            <div className="kpi"><strong>대상</strong> · 점검표를 자주 만드는 실무 담당자</div>
            <div className="kpi"><strong>입력</strong> · 팀장/과장 성함 + 엑셀 파일</div>
            <div className="kpi"><strong>결과</strong> · ODT 점검표 ZIP 다운로드</div>
          </div>
        </div>
      </section>

      <section className="glass" style={{ marginBottom: 14 }}>
        <div className="grid">
          <div>
            <label className="label">팀장님 성함</label>
            <input className="input" value={teamLeader} onChange={(e) => setTeamLeader(e.target.value)} placeholder="예: 홍길동" maxLength={10} />
          </div>
          <div>
            <label className="label">과장님 성함</label>
            <input className="input" value={manager} onChange={(e) => setManager(e.target.value)} placeholder="예: 김영희" maxLength={10} />
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <label className="label">엑셀(.xlsx) 업로드</label>
          <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>

        {error && <div className="error">{error}</div>}

        <button className="primary" onClick={generate} disabled={loading}>
          {loading ? '생성 중...' : '지금 점검표 ZIP 만들기'}
        </button>
      </section>

      {result && (
        <section className="glass" style={{ borderColor: 'rgba(52,211,153,.45)', marginBottom: 14 }}>
          <p className="soft" style={{ margin: 0 }}><strong style={{ color: '#6ee7b7' }}>{result.count}개</strong> 점검표 생성 완료. 바로 내려받아 확인해 주세요.</p>
          <a href={result.downloadUrl} download="점검표_결과.zip" className="primary" style={{ display: 'inline-block', textDecoration: 'none' }}>ZIP 다운로드</a>
        </section>
      )}
    </div>
  );
}
