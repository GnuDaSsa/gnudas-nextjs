'use client';
import { useEffect, useRef, useState } from 'react';

const TOOLS = [
  { icon: '🧠', label: 'MBTI 검사기', href: '/mbti', color: '#7c3aed' },
  { icon: '🔮', label: '테토에겐 테스트', href: '/teto', color: '#2563eb' },
  { icon: '📋', label: '점검표 생성기', href: '/checklist', color: '#0891b2' },
  { icon: '📰', label: '보도자료 생성기', href: '/press', color: '#059669' },
  { icon: '⚖️', label: 'AI 법률 검색', href: '/law', color: '#d97706' },
  { icon: '🎨', label: '이미지 프롬프트', href: '/img-prompt', color: '#db2777' },
  { icon: '🎙️', label: '녹음 변환·요약', href: '/record', color: '#9333ea' },
  { icon: '💡', label: '꿀팁 공유', href: '/tips', color: '#16a34a' },
  { icon: '🚀', label: '아이디어 제안소', href: '/ideas', color: '#e11d48' },
];

function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number; twinkle: number }[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.15 + 0.03,
        opacity: Math.random(),
        twinkle: Math.random() * 0.02 + 0.005,
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const s of stars) {
        s.opacity += s.twinkle;
        if (s.opacity > 1 || s.opacity < 0) s.twinkle *= -1;
        s.y += s.speed;
        if (s.y > canvas!.height) { s.y = 0; s.x = Math.random() * canvas!.width; }
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(180, 210, 255, ${Math.max(0, Math.min(1, s.opacity))})`;
        ctx!.fill();
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

function FloatingOrb({ color, size, top, left, delay }: { color: string; size: number; top: string; left: string; delay: number }) {
  return (
    <div style={{
      position: 'absolute',
      top, left,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      filter: 'blur(80px)',
      opacity: 0.18,
      animation: `floatOrb ${6 + delay}s ease-in-out infinite alternate`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none',
    }} />
  );
}

export default function HomePage() {
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes floatOrb {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(30px, -40px) scale(1.15); }
        }
        @keyframes heroGlow {
          0%, 100% { text-shadow: 0 0 40px rgba(117,232,255,0.5), 0 0 80px rgba(139,92,246,0.3); }
          50% { text-shadow: 0 0 60px rgba(117,232,255,0.8), 0 0 120px rgba(139,92,246,0.5); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(117,232,255,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(117,232,255,0); }
        }
        @keyframes lineExpand {
          from { width: 0; opacity: 0; }
          to { width: min(580px, 95%); opacity: 1; }
        }
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tool-card:hover {
          transform: translateY(-6px) scale(1.03) !important;
          border-color: rgba(117,232,255,0.5) !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(117,232,255,0.15) !important;
        }
        .tool-card {
          transition: transform 0.25s cubic-bezier(0.2,0.9,0.2,1),
                      box-shadow 0.25s ease,
                      border-color 0.25s ease !important;
        }
      `}</style>

      <StarCanvas />

      {/* 배경 오브 */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <FloatingOrb color="rgba(117,232,255,1)" size={500} top="5%" left="10%" delay={0} />
        <FloatingOrb color="rgba(139,92,246,1)" size={600} top="30%" left="70%" delay={2} />
        <FloatingOrb color="rgba(255,119,230,1)" size={400} top="70%" left="20%" delay={4} />
        <FloatingOrb color="rgba(59,130,246,1)" size={350} top="60%" left="80%" delay={1} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1200, margin: '0 auto', padding: '1rem 1.5rem 3rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}>

        {/* ── HERO ── */}
        <div style={{ textAlign: 'center', padding: '3rem 0 2.5rem', position: 'relative' }}>
          {/* 배지 */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0.4rem 1rem', borderRadius: 999,
            border: '1px solid rgba(117,232,255,0.4)',
            background: 'rgba(117,232,255,0.08)',
            fontSize: '0.82rem', fontWeight: 700, color: '#75e8ff',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            animation: 'badgePulse 3s ease-in-out infinite',
            marginBottom: '1.4rem',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#75e8ff', display: 'inline-block' }} />
            AI CLUB · Deep Learning Crew
          </div>

          {/* 메인 타이틀 */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: '0 0 1rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #75e8ff 40%, #a78bfa 70%, #ff77e6 100%)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'gradientShift 6s ease infinite, heroGlow 4s ease-in-out infinite',
          }}>
            GnuDaS<br />GPT World
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(213,222,243,0.85)',
            maxWidth: 560, margin: '0 auto 2rem',
            lineHeight: 1.7, fontWeight: 500,
          }}>
            AI 클럽을 위한 올인원 도구 허브.<br />
            GPT·Gemini 기반 9가지 기능을 한 곳에서.
          </p>

          {/* 메타 배지들 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
            {['회장 사진우', '총무 김동주', 'Updated 2026.02'].map((b) => (
              <span key={b} style={{
                padding: '0.35rem 0.85rem', borderRadius: 999,
                border: '1px solid rgba(130,207,255,0.35)',
                background: 'rgba(8,20,50,0.6)',
                color: '#c8deff', fontSize: '0.84rem', fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}>{b}</span>
            ))}
          </div>

          {/* 구분선 */}
          <div style={{
            height: 2, margin: '1.5rem auto 0',
            background: 'linear-gradient(90deg, transparent, rgba(122,223,255,0.8), rgba(194,118,255,0.7), transparent)',
            borderRadius: 2,
            animation: 'lineExpand 1.2s cubic-bezier(0.2,0.9,0.2,1) 0.4s both',
          }} />
        </div>

        {/* ── 스탯 ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
          marginBottom: '2rem',
        }}>
          {[
            { num: '9', label: 'AI 도구', sub: 'GPT·Gemini 기반' },
            { num: '24/7', label: '상시 접속', sub: 'Vercel 글로벌 배포' },
            { num: '∞', label: '가능성', sub: '나만의 AI 콘텐츠' },
          ].map((s, i) => (
            <div key={i} style={{
              borderRadius: 20, padding: '1.4rem',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
              animation: `cardEntrance 0.6s cubic-bezier(0.2,0.9,0.2,1) ${0.2 + i * 0.1}s both`,
            }}>
              <div style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900,
                background: 'linear-gradient(135deg, #75e8ff, #a78bfa)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              }}>{s.num}</div>
              <div style={{ fontWeight: 800, color: '#f0f6ff', fontSize: '1rem', marginTop: 2 }}>{s.label}</div>
              <div style={{ color: '#8db9ff', fontSize: '0.8rem', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── 도구 그리드 ── */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.1rem', fontWeight: 700, color: '#8db9ff',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>Tools</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.85rem',
          }}>
            {TOOLS.map((tool, i) => (
              <a
                key={i}
                href={tool.href}
                className="tool-card"
                onMouseEnter={() => setHoveredTool(i)}
                onMouseLeave={() => setHoveredTool(null)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 10,
                  padding: '1.2rem 1.1rem',
                  borderRadius: 18,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: hoveredTool === i
                    ? `linear-gradient(135deg, ${tool.color}22, rgba(8,10,34,0.8))`
                    : 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  animation: `cardEntrance 0.6s cubic-bezier(0.2,0.9,0.2,1) ${0.1 + i * 0.06}s both`,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: `${tool.color}33`,
                  border: `1px solid ${tool.color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>{tool.icon}</div>
                <div style={{ fontWeight: 800, color: '#f0f6ff', fontSize: '0.95rem', lineHeight: 1.3 }}>{tool.label}</div>
                <div style={{
                  width: 24, height: 2, borderRadius: 2,
                  background: tool.color,
                  opacity: hoveredTool === i ? 1 : 0.4,
                  transition: 'opacity 0.2s, width 0.3s',
                  ...(hoveredTool === i ? { width: 40 } : {}),
                }} />
              </a>
            ))}
          </div>
        </div>

        {/* ── 활동 패널 ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
          animation: 'cardEntrance 0.7s cubic-bezier(0.2,0.9,0.2,1) 0.8s both',
        }}>
          {[
            {
              title: '활동내용 — Passive',
              items: ['자료공유', '아이디어 제안 및 고도화', '업무활용사례 질의응답', '카톡방 운영'],
              color: '#75e8ff',
            },
            {
              title: '활동내용 — Active',
              items: ['반기 1회 오프라인 모임', '아이디어회의', '이번 분기 목표: 나만의 AI콘텐츠 만들기'],
              color: '#a78bfa',
            },
          ].map((panel, i) => (
            <div key={i} style={{
              borderRadius: 20,
              border: `1px solid ${panel.color}33`,
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)',
              padding: '1.3rem 1.4rem',
            }}>
              <div style={{ fontWeight: 800, color: panel.color, fontSize: '0.9rem', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>
                {panel.title}
              </div>
              {panel.items.map((item, j) => (
                <div key={j} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: '#c8deff', fontSize: '0.92rem', fontWeight: 600,
                  padding: '0.3rem 0',
                  borderBottom: j < panel.items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: panel.color, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
