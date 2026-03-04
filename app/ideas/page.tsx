'use client';
import { useState, useEffect } from 'react';

interface Idea {
  _id: string;
  title: string;
  content: string;
  nickname: string;
  status: string;
  createdAt: string;
}

const STATUSES = ['제안됨', '검토중', '채택', '보류'];
const STATUS_COLORS: Record<string, string> = {
  '제안됨': '#75e8ff',
  '검토중': '#f59e0b',
  '채택': '#34d399',
  '보류': '#ef4444',
};

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [form, setForm] = useState({ title: '', content: '', nickname: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchIdeas(); }, []);

  async function fetchIdeas() {
    const res = await fetch('/api/ideas');
    const data = await res.json();
    setIdeas(data.ideas || []);
  }

  async function submitIdea() {
    if (!form.title || !form.content || !form.nickname) { alert('모든 필드를 입력해주세요.'); return; }
    if (form.content.length < 10) { alert('내용을 10자 이상 입력해주세요.'); return; }
    setLoading(true);
    try {
      await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ title: '', content: '', nickname: '' });
      setShowForm(false);
      fetchIdeas();
    } finally {
      setLoading(false);
    }
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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>💡 아이디어 제안소</h1>
          <p style={{ color: '#d5def3', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>클럽 활동에 대한 아이디어를 자유롭게 제안해주세요.</p>
        </div>
        <button style={btnStyle} onClick={() => setShowForm(!showForm)}>
          {showForm ? '닫기' : '+ 아이디어 제안'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, border: '1px solid rgba(117,232,255,0.4)' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#75e8ff', fontWeight: 800 }}>아이디어 제안</h3>
          <div>
            <label style={labelStyle}>제목 (최대 100자)</label>
            <input style={inputStyle} placeholder="아이디어 제목" maxLength={100} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={labelStyle}>닉네임 (최대 30자)</label>
            <input style={inputStyle} placeholder="닉네임" maxLength={30} value={form.nickname} onChange={e => setForm(f => ({...f, nickname: e.target.value}))} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={labelStyle}>내용 (10~500자)</label>
            <textarea
              style={{ ...inputStyle, height: 100, resize: 'vertical' }}
              placeholder="아이디어를 자세히 설명해주세요..."
              maxLength={500}
              value={form.content}
              onChange={e => setForm(f => ({...f, content: e.target.value}))}
            />
            <div style={{ color: '#4a5f8a', fontSize: '0.78rem', textAlign: 'right', marginTop: 2 }}>{form.content.length}/500</div>
          </div>
          <button style={{ ...btnStyle, marginTop: 12, opacity: loading ? 0.7 : 1 }} onClick={submitIdea} disabled={loading}>
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      )}

      {ideas.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#8db9ff', padding: '2rem' }}>
          아직 등록된 아이디어가 없습니다. 첫 번째 아이디어를 제안해보세요!
        </div>
      ) : (
        ideas.map(idea => (
          <div key={idea._id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: 999,
                    background: `${STATUS_COLORS[idea.status]}22`,
                    border: `1px solid ${STATUS_COLORS[idea.status]}66`,
                    color: STATUS_COLORS[idea.status],
                    fontSize: '0.78rem', fontWeight: 700,
                  }}>{idea.status}</span>
                  <span style={{ color: '#8db9ff', fontSize: '0.8rem' }}>{idea.nickname}</span>
                  <span style={{ color: '#4a5f8a', fontSize: '0.78rem' }}>{new Date(idea.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <h3 style={{ margin: '0 0 6px', color: '#f3f7ff', fontWeight: 800, fontSize: '1.05rem' }}>{idea.title}</h3>
                <p style={{ margin: 0, color: '#d5def3', fontSize: '0.9rem', lineHeight: 1.6 }}>{idea.content}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
