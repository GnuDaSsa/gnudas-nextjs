'use client';
import { useState } from 'react';

export default function RecordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  async function transcribe() {
    if (!file) return;
    setLoading(true); setTranscript(''); setSummary(''); setProgress('파일 업로드 중...');
    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress('음성 변환 중 (파일 크기에 따라 시간이 걸릴 수 있습니다)...');
      const res = await fetch('/api/record', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) { alert(data.error); return; }
      setTranscript(data.transcript || '');
      setSummary(data.summary || '');
      setProgress('완료!');
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
  const btnStyle = {
    background: 'linear-gradient(90deg,#75e8ff,#8b5cf6)',
    color: '#fff', fontWeight: 800, border: 'none',
    borderRadius: 10, padding: '0.65rem 1.4rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '0.95rem', opacity: loading ? 0.7 : 1,
  };

  function downloadTxt(text: string, filename: string) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.4rem' }}>녹음 TXT 변환 및 요약</h1>
      <p style={{ color: '#d5def3', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
        음성 파일을 텍스트로 변환하고 AI가 요약합니다. (최대 25MB, mp3/wav/m4a/ogg 등)
      </p>

      <div style={cardStyle}>
        <label style={{ fontWeight: 700, color: '#8db9ff', fontSize: '0.9rem', display: 'block', marginBottom: 8 }}>음성 파일 선택</label>
        <input
          type="file"
          accept="audio/*"
          style={{ color: '#eef4ff', marginBottom: 12 }}
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        {file && (
          <div style={{ color: '#d5def3', fontSize: '0.85rem', marginBottom: 12 }}>
            선택된 파일: {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
          </div>
        )}

        <button style={btnStyle} onClick={transcribe} disabled={loading || !file}>
          {loading ? `${progress}` : '변환 시작'}
        </button>
      </div>

      {transcript && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 800, color: '#75e8ff' }}>변환된 텍스트</div>
            <button
              onClick={() => downloadTxt(transcript, `transcript_${file?.name || 'record'}.txt`)}
              style={{ background: 'rgba(117,232,255,0.15)', border: '1px solid rgba(117,232,255,0.3)', borderRadius: 6, color: '#75e8ff', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
            >TXT 다운로드</button>
          </div>
          <div style={{ color: '#eef4ff', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
            {transcript}
          </div>
        </div>
      )}

      {summary && (
        <div style={cardStyle}>
          <div style={{ fontWeight: 800, color: '#ff77e6', marginBottom: 10 }}>AI 요약</div>
          <div style={{ color: '#eef4ff', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}
