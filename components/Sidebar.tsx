'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Function', type: 'section' },
  { label: 'Home', href: '/' },
  { label: 'MBTI 검사기', href: '/mbti' },
  { label: '테토에겐 테스트', href: '/teto' },
  { label: '도급위탁용역 점검표 생성', href: '/checklist' },
  { label: '생성형 AI 보도자료 생성기', href: '/press' },
  { label: 'AI 법률 검색', href: '/law' },
  { label: 'AI 이미지 프롬프트 변환기', href: '/img-prompt' },
  { label: '녹음TXT변환 및 요약', href: '/record' },
  { label: 'divider', type: 'divider' },
  { label: 'Community', type: 'section' },
  { label: 'AI 꿀팁 공유', href: '/tips' },
  { label: '아이디어 제안소', href: '/ideas' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        minHeight: '100vh',
        background: 'rgba(8,10,34,0.72)',
        borderRight: '1px solid rgba(125,187,255,0.2)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        flexShrink: 0,
      }}
    >
      {NAV_ITEMS.map((item, i) => {
        if (item.type === 'section') {
          return (
            <div
              key={i}
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#8db9ff',
                letterSpacing: '1px',
                marginBottom: '0.4rem',
                marginTop: i === 0 ? 0 : '0.6rem',
              }}
            >
              {item.label}
            </div>
          );
        }
        if (item.type === 'divider') {
          return (
            <div
              key={i}
              style={{
                borderTop: '1px solid #2d3e67',
                margin: '0.6rem 0',
              }}
            />
          );
        }
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href!}
            style={{
              display: 'block',
              padding: '0.55rem 0.85rem',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '0.92rem',
              color: active ? '#75e8ff' : '#d5def3',
              background: active
                ? 'rgba(117,232,255,0.12)'
                : 'transparent',
              border: active
                ? '1px solid rgba(117,232,255,0.3)'
                : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
