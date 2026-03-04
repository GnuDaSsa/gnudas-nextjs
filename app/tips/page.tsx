'use client';
import { useState, useEffect } from 'react';

interface Tip {
  _id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  imageUrl?: string;
  likes: number;
  createdAt: string;
}

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [form, setForm] = useState({ title: '', content: '', author: '', category: 'ChatGPT' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const CATEGORIES = ['ChatGPT', 'Gemini', 'Claude', 'Midjourney', 'DALL-E', '기타'];

  useEffect(() => { fetchTips(); }, []);

  async function fetchTips() {
    const res = await fetch('/api/tips');
    const data = await res.json();
    setTips(data.tips || []);
  }

  async function submitTip() {
    if (!form.title || !form.content || !form.author) { alert('모든 필드를 입력해주세요.'); return; }
    setLoading(true);
    try {
      await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ title: '', content: '', author: '', category: 'ChatGPT' });
      setShowForm(false);
      fetchTips();
    } finally {
      setLoading(false);
    }
  }

  async function likeTip(id: string) {
    await fetch(`/api/tips/${id}/like`, { method: 'POST' });
    fetchTips();
  }

  const cardStyle = {
    borderRadius: 14,
    border: '1px solid rgba(125,187,255,0.3)',
    background: 'rgba(8,10,34,0.6)',
    padding: '1.2rem',
    marginBottom: '0.8rem',
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
    borderRadius: 10, padding: '0.55rem 1.2rem',
    cursor: 'pointer', fontSize: '0.9rem',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>💡 AI 꿀팁 공유</h1>
          <p style={{ color: '#d5def3', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>AI 활용 꿀팁을 공유해보세요!</p>
        </div>
        <button style={btnStyle} onClick={() => setShowForm(!showForm)}>
          {showForm ? '닫기' : '+ 꿀팁 등록'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, border: '1px solid rgba(117,232,255,0.4)' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#75e8ff', fontWeight: 800 }}>꿀팁 등록</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>제목</label>
              <input style={inputStyle} placeholder="꿀팁 제목" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
            </div>
            <div>
              <label style={labelStyle}>카테고리</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0c1242' }}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={labelStyle}>작성자</label>
            <input style={inputStyle} placeholder="닉네임" value={form.author} onChange={e => setForm(f => ({...f, author: e.target.value}))} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={labelStyle}>내용</label>
            <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' }} placeholder="꿀팁 내용을 작성하세요..." value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} />
          </div>
          <button style={{ ...btnStyle, marginTop: 12, opacity: loading ? 0.7 : 1 }} onClick={submitTip} disabled={loading}>
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      )}

      {tips.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#8db9ff', padding: '2rem' }}>
          아직 등록된 꿀팁이 없습니다. 첫 번째 꿀팁을 등록해보세요!
        </div>
      ) : (
        tips.map(tip => (
          <div key={tip._id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: 999, background: 'rgba(117,232,255,0.15)', border: '1px solid rgba(117,232,255,0.3)', color: '#75e8ff', fontSize: '0.78rem', fontWeight: 700 }}>{tip.category}</span>
                  <span style={{ color: '#8db9ff', fontSize: '0.8rem' }}>{tip.author}</span>
                  <span style={{ color: '#4a5f8a', fontSize: '0.78rem' }}>{new Date(tip.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <h3 style={{ margin: '0 0 6px', color: '#f3f7ff', fontWeight: 800, fontSize: '1.05rem' }}>{tip.title}</h3>
                <p style={{ margin: 0, color: '#d5def3', fontSize: '0.9rem', lineHeight: 1.6 }}>{tip.content}</p>
              </div>
              <button
                onClick={() => likeTip(tip._id)}
                style={{ marginLeft: 12, background: 'rgba(255,119,230,0.12)', border: '1px solid rgba(255,119,230,0.3)', borderRadius: 10, color: '#ff77e6', padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}
              >
                ❤️ {tip.likes || 0}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
