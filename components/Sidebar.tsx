'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Tools', type: 'section' },
  { num: '00', label: 'Home', href: '/' },
  { num: '01', label: 'MBTI 검사기', href: '/mbti' },
  { num: '02', label: '테토에겐 테스트', href: '/teto' },
  { num: '03', label: '점검표 생성', href: '/checklist' },
  { num: '04', label: '보도자료 생성기', href: '/press' },
  { num: '05', label: 'AI 법률 검색', href: '/law' },
  { num: '06', label: '이미지 프롬프트', href: '/img-prompt' },
  { num: '07', label: '녹음 변환·요약', href: '/record' },
  { label: 'divider', type: 'divider' },
  { label: 'Community', type: 'section' },
  { num: '08', label: '꿀팁 공유', href: '/tips' },
  { num: '09', label: '아이디어 제안소', href: '/ideas' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .nav-link { transition: background 0.15s ease, color 0.15s ease; }
        .nav-link:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>
      <aside style={{
        width: 220,
        minHeight: '100vh',
        background: '#0a0a0f',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* 로고 */}
        <div style={{
          padding: '1.1rem 1.4rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontFamily: 'monospace',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: '#f0f0f0',
          letterSpacing: '0.08em',
        }}>DLC</div>

        {/* 네비 */}
        <nav style={{ padding: '0.8rem 0', flex: 1 }}>
          {NAV_ITEMS.map((item, i) => {
            if (item.type === 'section') {
              return (
                <div key={i} style={{
                  padding: '0.8rem 1.4rem 0.3rem',
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  color: '#444',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}>
                  {item.label}
                </div>
              );
            }
            if (item.type === 'divider') {
              return (
                <div key={i} style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  margin: '0.6rem 0',
                }} />
              );
            }
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href!}
                className="nav-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1.4rem',
                  textDecoration: 'none',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  borderLeft: active ? '2px solid #75e8ff' : '2px solid transparent',
                }}
              >
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  color: active ? '#75e8ff' : '#444',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}>{item.num}</span>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#f0f0f0' : '#888',
                  letterSpacing: '0.01em',
                }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 하단 */}
        <div style={{
          padding: '1rem 1.4rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontFamily: 'monospace',
          fontSize: '0.65rem',
          color: '#333',
          letterSpacing: '0.06em',
        }}>© 2026 DLC</div>
      </aside>
    </>
  );
}
