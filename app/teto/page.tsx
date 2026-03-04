'use client';

import { useState } from 'react';

// ─── 질문 데이터 ──────────────────────────────────────────────────────────────
// 첫 번째 선택지 = 테토 성향(T), 두 번째 = 에겐 성향(E)
interface TetoQuestion {
  question: string;
  options: [string, string]; // [테토, 에겐]
}

const QUESTIONS: TetoQuestion[] = [
  {
    question: '친구들과 만날 때 나는...',
    options: [
      '활발하게 대화를 이끌어가는 편이다',
      '조용히 듣고 있다가 적절한 타이밍에 말한다',
    ],
  },
  {
    question: '새로운 사람을 만날 때...',
    options: [
      '먼저 다가가서 인사를 건넨다',
      '상대방이 먼저 다가올 때까지 기다린다',
    ],
  },
  {
    question: '문제가 생겼을 때 나는...',
    options: [
      '즉시 해결책을 찾으려고 적극적으로 나선다',
      '차분히 상황을 파악한 후 신중하게 대응한다',
    ],
  },
  {
    question: '에너지 충전 방식은...',
    options: [
      '사람들과 어울리고 활동할 때 충전된다',
      '혼자만의 조용한 시간이 있어야 충전된다',
    ],
  },
  {
    question: '결정을 내릴 때...',
    options: [
      '빠르게 판단하고 바로 행동한다',
      '충분히 고민하고 신중하게 결정한다',
    ],
  },
  {
    question: '감정 표현 방식은...',
    options: [
      '느끼는 것을 솔직하고 직접적으로 표현한다',
      '감정을 안으로 삼키거나 조심스럽게 표현한다',
    ],
  },
  {
    question: '주목받는 상황에서 나는...',
    options: [
      '시선이 집중되는 게 오히려 신나고 자신감이 생긴다',
      '주목받는 상황이 부담스럽고 뒤에 있는 게 편하다',
    ],
  },
  {
    question: '갈등이 생겼을 때...',
    options: [
      '불편하더라도 직접 이야기하여 빠르게 해결한다',
      '상황이 자연스럽게 해결되기를 기다리는 편이다',
    ],
  },
  {
    question: '계획 없이 시간이 생기면...',
    options: [
      '친구에게 바로 연락해 뭔가 함께 하려 한다',
      '집에서 혼자 쉬거나 취미를 즐긴다',
    ],
  },
  {
    question: '발표나 무대 앞에 서게 된다면...',
    options: [
      '긴장보다는 설레는 마음이 더 크다',
      '긴장되지만 최대한 준비해서 임한다',
    ],
  },
  {
    question: '오랫동안 연락 없던 친구에게...',
    options: [
      '먼저 연락해서 안부를 묻고 만날 약속을 잡는다',
      '그리워도 먼저 연락하기가 어렵고 기다린다',
    ],
  },
];

// ─── 결과 데이터 ──────────────────────────────────────────────────────────────
interface ResultInfo {
  label: string;
  emoji: string;
  desc: string;
  traits: string[];
  tip: string;
}

const RESULTS: Record<'teto' | 'egen' | 'balance', ResultInfo> = {
  teto: {
    label: '테토형',
    emoji: '🔥',
    desc: '에너지 넘치고 주도적인 테토남/테토녀 스타일! 사람들 사이에서 자연스럽게 중심이 되고, 솔직하고 직접적인 소통을 즐깁니다. 밝은 에너지로 주변을 환기시키는 타입입니다.',
    traits: ['활발하고 사교적', '직접적인 소통', '빠른 결단력', '에너지 발산형', '리더십 있음'],
    tip: '에겐형과 함께하면 서로의 장점이 빛나는 환상의 조합이 될 수 있어요!',
  },
  egen: {
    label: '에겐형',
    emoji: '🌙',
    desc: '차분하고 신중한 에겐남/에겐녀 스타일! 깊은 관찰력과 세심함으로 주변을 배려하며, 혼자만의 시간을 소중히 여깁니다. 조용하지만 강한 내면을 가진 타입입니다.',
    traits: ['신중하고 사려깊음', '깊은 관찰력', '혼자 있는 시간 선호', '에너지 충전형', '내면이 풍부'],
    tip: '테토형과 함께하면 서로의 부족한 부분을 채워주는 멋진 파트너가 될 수 있어요!',
  },
  balance: {
    label: '균형형',
    emoji: '⚖️',
    desc: '테토와 에겐의 장점을 골고루 갖춘 균형형! 상황에 따라 유연하게 대처하며, 외향적인 면과 내향적인 면을 모두 발휘할 수 있습니다. 적응력이 뛰어난 타입입니다.',
    traits: ['유연한 적응력', '상황 판단력 뛰어남', '외향·내향 균형', '다양한 사람과 어울림', '자기만의 세계 있음'],
    tip: '양쪽의 장점을 모두 갖고 있으니, 어떤 상황에서도 빛날 수 있어요!',
  },
};

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #070a1b 0%, #0d1535 50%, #070a1b 100%)',
    padding: '24px 16px',
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    color: '#e2e8f0',
  } as React.CSSProperties,
  center: {
    maxWidth: 680,
    margin: '0 auto',
  } as React.CSSProperties,
  card: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: '32px 28px',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    marginBottom: 24,
  } as React.CSSProperties,
  title: {
    fontSize: 26,
    fontWeight: 800,
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #f9a8d4, #c084fc, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 32,
  },
  progressBar: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    height: 8,
    marginBottom: 24,
    overflow: 'hidden',
  } as React.CSSProperties,
  questionText: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.6,
    marginBottom: 24,
    color: '#f1f5f9',
  },
  btn: (variant: 'primary' | 'secondary'): React.CSSProperties => ({
    width: '100%',
    padding: '14px 20px',
    marginBottom: 10,
    borderRadius: 12,
    border: variant === 'secondary' ? '1px solid rgba(255,255,255,0.15)' : 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 15,
    background:
      variant === 'primary'
        ? 'linear-gradient(135deg, #9333ea, #3b82f6)'
        : 'rgba(255,255,255,0.06)',
    color: '#fff',
    transition: 'all 0.2s',
  }),
};

function OptionButton({
  text,
  selected,
  onClick,
}: {
  text: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '16px 20px',
        marginBottom: 12,
        borderRadius: 14,
        border: `1.5px solid ${selected ? '#9333ea' : 'rgba(255,255,255,0.12)'}`,
        background: selected
          ? 'linear-gradient(135deg, rgba(147,51,234,0.35), rgba(59,130,246,0.25))'
          : 'rgba(255,255,255,0.04)',
        color: selected ? '#e9d5ff' : '#cbd5e1',
        fontSize: 15,
        cursor: 'pointer',
        textAlign: 'left' as const,
        lineHeight: 1.5,
        fontWeight: selected ? 700 : 400,
        transition: 'all 0.2s',
      }}
    >
      {text}
    </button>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function TetoPage() {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null); // 0=테토, 1=에겐
  const [answers, setAnswers] = useState<number[]>([]); // 0=테토, 1=에겐
  const [resultKey, setResultKey] = useState<'teto' | 'egen' | 'balance' | null>(null);
  const [tetoCount, setTetoCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function startQuiz() {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setResultKey(null);
    setSaved(false);
    setPhase('quiz');
  }

  function handleSelect(idx: number) {
    setSelected(idx);
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];

    if (current < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      // 결과 계산
      const tCount = newAnswers.filter((a) => a === 0).length;
      const eCount = newAnswers.filter((a) => a === 1).length;
      setTetoCount(tCount);

      let key: 'teto' | 'egen' | 'balance';
      if (tCount >= 7) key = 'teto';
      else if (eCount >= 7) key = 'egen';
      else key = 'balance';

      setResultKey(key);
      setPhase('result');
      saveResult(key, tCount, eCount);
    }
  }

  function handlePrev() {
    if (current === 0) return;
    const prevAnswers = [...answers];
    prevAnswers.pop();
    setAnswers(prevAnswers);
    setCurrent((c) => c - 1);
    setSelected(answers[current - 1] ?? null);
  }

  async function saveResult(key: string, tCount: number, eCount: number) {
    setSaving(true);
    try {
      await fetch('/api/teto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: key, tetoScore: tCount, egenScore: eCount }),
      });
      setSaved(true);
    } catch {
      // 저장 실패 무시
    } finally {
      setSaving(false);
    }
  }

  const progress = Math.round((current / QUESTIONS.length) * 100);
  const result = resultKey ? RESULTS[resultKey] : null;

  // ── 인트로 ───────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={S.page}>
        <div style={S.center}>
          <div style={S.card}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 60, marginBottom: 12 }}>🔥🌙</div>
              <h1 style={S.title}>테토에겐 테스트</h1>
              <p style={S.subtitle}>나는 테토형일까, 에겐형일까?</p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  background: 'rgba(234,88,12,0.12)',
                  border: '1px solid rgba(234,88,12,0.3)',
                  borderRadius: 14,
                  padding: '18px 16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔥</div>
                <p style={{ color: '#fb923c', fontWeight: 700, marginBottom: 6 }}>테토형</p>
                <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
                  활발하고 주도적인 에너지 발산형. 먼저 다가가고 직접적으로 표현한다.
                </p>
              </div>
              <div
                style={{
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 14,
                  padding: '18px 16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌙</div>
                <p style={{ color: '#818cf8', fontWeight: 700, marginBottom: 6 }}>에겐형</p>
                <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
                  차분하고 신중한 에너지 충전형. 깊게 관찰하고 세심하게 배려한다.
                </p>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 24,
                color: '#94a3b8',
                fontSize: 13,
                lineHeight: 1.8,
              }}
            >
              총 11개 질문 · 각 2지선다 · 약 2~3분 소요
            </div>

            <button style={{ ...S.btn('primary'), marginBottom: 0 }} onClick={startQuiz}>
              테스트 시작하기 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 퀴즈 ─────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    const q = QUESTIONS[current];
    return (
      <div style={S.page}>
        <div style={S.center}>
          <div style={S.card}>
            {/* 진행률 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: '#64748b',
                marginBottom: 8,
              }}
            >
              <span>Q {current + 1} / {QUESTIONS.length}</span>
              <span>{progress}%</span>
            </div>
            <div style={S.progressBar}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #9333ea, #3b82f6)',
                  borderRadius: 8,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* 질문 */}
            <p style={S.questionText}>{q.question}</p>

            {/* 선택지 */}
            <OptionButton
              text={q.options[0]}
              selected={selected === 0}
              onClick={() => handleSelect(0)}
            />
            <OptionButton
              text={q.options[1]}
              selected={selected === 1}
              onClick={() => handleSelect(1)}
            />

            {/* 네비게이션 */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {current > 0 && (
                <button
                  onClick={handlePrev}
                  style={{
                    flex: 1,
                    padding: '13px 0',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  ← 이전
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={selected === null}
                style={{
                  flex: 2,
                  padding: '13px 0',
                  borderRadius: 12,
                  border: 'none',
                  background:
                    selected !== null
                      ? 'linear-gradient(135deg, #9333ea, #3b82f6)'
                      : 'rgba(255,255,255,0.06)',
                  color: selected !== null ? '#fff' : '#64748b',
                  cursor: selected !== null ? 'pointer' : 'default',
                  fontWeight: 700,
                  fontSize: 15,
                  transition: 'all 0.2s',
                }}
              >
                {current === QUESTIONS.length - 1 ? '결과 보기 →' : '다음 →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 결과 ─────────────────────────────────────────────────────────
  if (phase === 'result' && result && resultKey) {
    const egenCount = QUESTIONS.length - tetoCount;
    const tetoPct = Math.round((tetoCount / QUESTIONS.length) * 100);

    const accentColor =
      resultKey === 'teto' ? '#fb923c' : resultKey === 'egen' ? '#818cf8' : '#34d399';
    const accentBg =
      resultKey === 'teto'
        ? 'rgba(234,88,12,0.12)'
        : resultKey === 'egen'
        ? 'rgba(99,102,241,0.12)'
        : 'rgba(52,211,153,0.12)';
    const accentBorder =
      resultKey === 'teto'
        ? 'rgba(234,88,12,0.3)'
        : resultKey === 'egen'
        ? 'rgba(99,102,241,0.3)'
        : 'rgba(52,211,153,0.3)';

    return (
      <div style={S.page}>
        <div style={S.center}>
          {/* 결과 메인 카드 */}
          <div style={S.card}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 72, marginBottom: 12 }}>{result.emoji}</div>
              <h2
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: accentColor,
                  marginBottom: 8,
                }}
              >
                {result.label}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7 }}>{result.desc}</p>
            </div>

            {/* 점수 바 */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: '#fb923c', fontWeight: 700 }}>테토 {tetoCount}점 ({tetoPct}%)</span>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>에겐 {egenCount}점 ({100 - tetoPct}%)</span>
              </div>
              <div
                style={{
                  background: 'rgba(99,102,241,0.3)',
                  borderRadius: 8,
                  height: 14,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${tetoPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ea580c, #fb923c)',
                    borderRadius: 8,
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
            </div>

            {/* 특성 태그 */}
            <div
              style={{
                background: accentBg,
                border: `1px solid ${accentBorder}`,
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 20,
              }}
            >
              <p style={{ color: accentColor, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                이런 특성이 있어요
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {result.traits.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 100,
                      background: 'rgba(255,255,255,0.08)',
                      color: '#cbd5e1',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* 팁 */}
            <div
              style={{
                background: 'rgba(52,211,153,0.08)',
                border: '1px solid rgba(52,211,153,0.25)',
                borderRadius: 14,
                padding: '16px 20px',
              }}
            >
              <p style={{ color: '#34d399', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                궁합 팁
              </p>
              <p style={{ color: '#a7f3d0', fontSize: 14, lineHeight: 1.6 }}>{result.tip}</p>
            </div>
          </div>

          {/* 저장 상태 & 재검사 */}
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 16 }}>
            {saving && '결과 저장 중...'}
            {saved && !saving && '결과가 저장되었습니다.'}
          </div>
          <button
            style={{ ...S.btn('primary'), marginBottom: 0 }}
            onClick={startQuiz}
          >
            다시 테스트하기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
