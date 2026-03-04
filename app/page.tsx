'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const TOOLS: { num: string; label: string; href: string; desc: string }[] = [
  { num: '01', label: 'MBTI 검사기',          href: '/mbti',       desc: 'GPT 기반 성격 유형 분석' },
  { num: '02', label: '테토에겐 테스트',       href: '/teto',       desc: '감수성 유형 진단' },
  { num: '03', label: '도급위탁용역 점검표',   href: '/checklist',  desc: '업무 체크리스트 자동 생성' },
  { num: '04', label: '보도자료 생성기',       href: '/press',      desc: 'AI 작성 보도자료 초안' },
  { num: '05', label: 'AI 법률 검색',          href: '/law',        desc: '법령 기반 질의응답' },
  { num: '06', label: '이미지 프롬프트',       href: '/img-prompt', desc: '생성형 AI 프롬프트 작성기' },
  { num: '07', label: '녹음 변환·요약',        href: '/record',     desc: '음성 → 텍스트 + 요약' },
  { num: '08', label: '꿀팁 공유',             href: '/tips',       desc: '업무 AI 활용 노하우' },
  { num: '09', label: '아이디어 제안소',       href: '/ideas',      desc: '아이디어 수집 및 고도화' },
];

const PASSIVE_ACTIVITIES = [
  '자료공유',
  '아이디어 제안 및 고도화',
  '업무활용사례 질의응답',
  '카톡방 운영',
];

const ACTIVE_ACTIVITIES = [
  '반기 1회 오프라인 모임',
  '아이디어회의',
  '이번 분기 목표: 나만의 AI 콘텐츠 만들기',
];

export default function HomePage() {
  const [visible, setVisible] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);
  const [mouse, setMouse] = useState({ x: -999, y: -999 });
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function handleMouseLeave() {
    setMouse({ x: -999, y: -999 });
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tool-row {
          transition: background 0.18s ease;
        }
        .tool-row:hover {
          background: rgba(255,255,255,0.04) !important;
          cursor: pointer;
        }
      `}</style>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          color: '#f0f0f0',
          fontFamily: '"Inter", "Apple SD Gothic Neo", sans-serif',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(12px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 마우스 스포트라이트 */}
        <div style={{
          position: 'absolute',
          left: mouse.x - 200,
          top: mouse.y - 200,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(117,232,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          transition: 'left 0.08s ease, top 0.08s ease',
          zIndex: 0,
        }} />

        {/* ── 상단 헤더 ── */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.1rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#f0f0f0',
            letterSpacing: '0.08em',
          }}>DLC</span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            color: '#888',
            letterSpacing: '0.06em',
          }}>Updated 2026.02</span>
        </header>

        {/* ── 히어로 섹션 ── */}
        <section style={{
          padding: '4rem 2rem 3rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          maxWidth: 960,
          margin: '0 auto',
        }}>
          {/* 레이블 */}
          <div style={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#888',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '1.4rem',
          }}>AI 활용 동아리</div>

          {/* 메인 타이틀 */}
          <h1 style={{
            fontSize: 'clamp(3.2rem, 8vw, 7.5rem)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            margin: '0 0 0.15em',
            color: '#f0f0f0',
          }}>AI Club</h1>
          <h1 style={{
            fontSize: 'clamp(3.2rem, 8vw, 7.5rem)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            margin: '0 0 2rem',
            color: '#75e8ff',
          }}>Deep Learning Crew</h1>

          {/* 서브텍스트 + 배지 행 */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <p style={{
              fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
              color: '#888',
              lineHeight: 1.65,
              margin: 0,
              maxWidth: 480,
            }}>
              9가지 AI 도구 허브<br />
              GPT·Gemini 기반으로 업무를 스마트하게.
            </p>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}>
              {['회장 사진우', '총무 김동주'].map((b) => (
                <span key={b} style={{
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: '#888',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.3rem 0.7rem',
                  borderRadius: 4,
                  letterSpacing: '0.04em',
                }}>{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 도구 리스트 ── */}
        <section style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '2rem 2rem',
        }}>
          {/* 섹션 레이블 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            paddingBottom: '0.6rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: '#888',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>AI Tools</span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: '#888',
              letterSpacing: '0.06em',
            }}>09 items</span>
          </div>

          {/* 번호 목록 */}
          <div>
            {TOOLS.map((tool, i) => (
              <div
                key={i}
                className="tool-row"
                onClick={() => router.push(tool.href)}
                onMouseEnter={() => setHoveredTool(i)}
                onMouseLeave={() => setHoveredTool(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3rem 1fr auto',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.9rem 0.75rem',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'transparent',
                  borderRadius: 4,
                }}
              >
                {/* 번호 */}
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: hoveredTool === i ? '#75e8ff' : '#444',
                  letterSpacing: '0.04em',
                  transition: 'color 0.18s ease',
                }}>{tool.num}</span>

                {/* 이름 + 설명 */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.97rem',
                    fontWeight: 600,
                    color: hoveredTool === i ? '#f0f0f0' : '#c8c8c8',
                    transition: 'color 0.18s ease',
                  }}>{tool.label}</span>
                  <span style={{
                    fontSize: '0.78rem',
                    color: '#555',
                    fontFamily: 'monospace',
                  }}>{tool.desc}</span>
                </div>

                {/* 화살표 */}
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: hoveredTool === i ? '#75e8ff' : '#333',
                  transition: 'color 0.18s ease, transform 0.18s ease',
                  transform: hoveredTool === i ? 'translateX(3px)' : 'translateX(0)',
                  display: 'inline-block',
                }}>→</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 활동 소개 (2컬럼) ── */}
        <section style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '0 2rem 3rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Passive */}
          <div style={{
            padding: '2rem 1.5rem 2rem 0',
            borderRight: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: '#888',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '1.2rem',
            }}>활동내용 — Passive</div>
            {PASSIVE_ACTIVITIES.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem 0',
                borderBottom: i < PASSIVE_ACTIVITIES.length - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
              }}>
                <span style={{
                  width: 1,
                  height: '1em',
                  background: 'rgba(255,255,255,0.2)',
                  flexShrink: 0,
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Active */}
          <div style={{
            padding: '2rem 0 2rem 1.5rem',
          }}>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: '#75e8ff',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '1.2rem',
            }}>활동내용 — Active</div>
            {ACTIVE_ACTIVITIES.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem 0',
                borderBottom: i < ACTIVE_ACTIVITIES.length - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
              }}>
                <span style={{
                  width: 1,
                  height: '1em',
                  background: '#75e8ff',
                  opacity: 0.4,
                  flexShrink: 0,
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 푸터 ── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1.2rem 2rem',
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#444',
            letterSpacing: '0.06em',
          }}>© 2026 Deep Learning Crew</span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            color: '#333',
            letterSpacing: '0.06em',
          }}>AI Club</span>
        </footer>

      </div>
    </>
  );
}
