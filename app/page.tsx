'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const TOOLS: { label: string; href: string }[] = [
  { label: 'MBTI 검사기', href: '/mbti' },
  { label: '테토에겐 테스트', href: '/teto' },
  { label: '보도자료 생성기', href: '/press' },
  { label: '이미지 프롬프트', href: '/img-prompt' },
  { label: '녹음 변환·요약', href: '/record' },
  { label: '꿀팁 공유', href: '/tips' },
  { label: '아이디어 제안소', href: '/ideas' },
  { label: '공무원 비주얼노벨', href: '/novel' },
  { label: '공무원 영상', href: '/videos' },
  { label: '사주 로또 추출기', href: '/lotto-saju' },
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

type LocalWork = {
  branch: string;
  changedCount: number;
  changedFiles: string[];
  lastCommit: string;
  codingProcesses: string[];
  updatedAt: string;
  agentPipeline: { name: string; state: string; detail: string }[];
};

function isCodingProcess(line: string) {
  const v = line.toLowerCase();
  return v.includes('openclaw') || v.includes('codex') || v.includes('claude');
}

export default function HomePage() {
  const [visible, setVisible] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);
  const [localWork, setLocalWork] = useState<LocalWork | null>(null);
  const wasCodingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let mounted = true;

    const tick = async () => {
      try {
        const res = await fetch('/api/local-work', { cache: 'no-store' });
        const data = await res.json();
        if (mounted) {
          const codingNow = (data?.codingProcesses || []).some(isCodingProcess);
          wasCodingRef.current = codingNow;
          setLocalWork(data);
        }
      } catch {
        // ignore
      }
    };

    tick();
    const timer = setInterval(tick, 3000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <style>{`
        .tool-row { transition: background 0.18s ease, border-color 0.18s ease; }
        .tool-row:hover { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.12) !important; cursor: pointer; }
        .tool-row:hover .tool-arrow { transform: translateX(4px); color: #dfe5ee !important; }
        .tool-arrow { transition: transform 0.15s ease, color 0.15s ease; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #111318 0%, #151922 42%, #181d28 100%)',
        color: '#eef2f6',
        fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(12px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.1rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Link href="/" style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: '#f1f4f8',
            letterSpacing: '-0.02em',
            textDecoration: 'none',
          }}>DLC</Link>
          <span style={{
            fontSize: '0.78rem',
            color: '#868f9d',
            letterSpacing: '0.02em',
          }}>Updated 2026.03</span>
        </header>

        <section style={{
          padding: '4.25rem 2rem 2.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          maxWidth: 960,
          margin: '0 auto',
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6.2rem)',
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: '-0.06em',
            margin: '0 0 1rem',
            color: '#f3f5f8',
          }}>AI Club</h1>
          <div style={{
            fontSize: 'clamp(1.1rem, 2.8vw, 1.6rem)',
            lineHeight: 1.45,
            color: '#b8c0cc',
            maxWidth: 680,
            marginBottom: '1.5rem',
          }}>
            공공업무에 바로 쓰는 실용형 AI 도구를 빠르게 찾고 실행하는 워크스페이스.
          </div>

          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            {['회장 사진우', '총무 김동주'].map((b) => {
              const isChair = b.includes('회장');
              return (
                <span key={b} style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#d8e0ec',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isChair ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)'}`,
                  padding: '0.34rem 0.75rem',
                  borderRadius: 999,
                  letterSpacing: '-0.01em',
                }}>{b}</span>
              );
            })}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '1px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            {[
              { label: '도구 수', value: `${TOOLS.length}개` },
              { label: '활성 작업', value: `${localWork?.codingProcesses?.length ?? 0}개` },
              { label: '최근 커밋', value: localWork?.lastCommit ?? '확인 중' },
            ].map((item) => (
              <div key={item.label} style={{ padding: '0.9rem 0.1rem' }}>
                <div style={{ fontSize: '0.74rem', color: '#868f9d', marginBottom: '0.25rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#eef2f6' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '2.1rem 2rem 1.2rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.9rem',
            paddingBottom: '0.8rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{
              fontSize: '0.72rem',
              color: '#8c95a3',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>Tools</span>
            <span style={{
              fontSize: '0.72rem',
              color: '#8c95a3',
              letterSpacing: '0.02em',
            }}>{TOOLS.length} items</span>
          </div>

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
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 0.2rem',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'transparent',
                  borderRadius: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: hoveredTool === i ? '#f1f4f8' : '#c7ced8',
                    transition: 'color 0.18s ease',
                  }}>{tool.label}</span>
                </div>

                <span className="tool-arrow" style={{
                  fontSize: '0.85rem',
                  color: '#6f7886',
                  display: 'inline-block',
                }}>→</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '1rem 2rem 3.2rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            padding: '1.8rem 1.5rem 1.8rem 0',
            borderRight: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              fontSize: '0.72rem',
              color: '#8c95a3',
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
                <span style={{ fontSize: '0.92rem', color: '#afb7c2', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{
            padding: '1.8rem 0 1.8rem 1.5rem',
          }}>
            <div style={{
              fontSize: '0.72rem',
              color: '#d7dee7',
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
                  background: '#d7dee7',
                  opacity: 0.4,
                  flexShrink: 0,
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.92rem', color: '#afb7c2', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

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
            fontSize: '0.75rem',
            color: '#687180',
            letterSpacing: '0.02em',
          }}>© 2026 Deep Learning Crew</span>
          <span style={{
            fontSize: '0.72rem',
            color: '#687180',
            letterSpacing: '0.02em',
          }}>AI Club</span>
        </footer>

      </div>
    </>
  );
}
