'use client';

import { useState } from 'react';

import { ToolShell, toolShellStyles as styles } from '@/components/tools/ToolShell';

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
      className={`${styles.optionButton} ${selected ? styles.optionButtonSelected : ''}`}
    >
      {text}
    </button>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function TetoPage() {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [answers, setAnswers] = useState<Array<number | null>>([]); // 0=테토, 1=에겐
  const [resultKey, setResultKey] = useState<'teto' | 'egen' | 'balance' | null>(null);
  const [tetoCount, setTetoCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function startQuiz() {
    setAnswers(Array.from({ length: QUESTIONS.length }, () => null));
    setResultKey(null);
    setSaved(false);
    setPhase('quiz');
  }

  function handleSelect(questionIndex: number, optionIndex: number) {
    setAnswers((prev) => prev.map((value, index) => (index === questionIndex ? optionIndex : value)));
  }

  function handleSubmitQuiz() {
    if (answers.some((answer) => answer === null)) {
      return;
    }

    const resolvedAnswers = answers as number[];
    const tCount = resolvedAnswers.filter((answer) => answer === 0).length;
    const eCount = resolvedAnswers.filter((answer) => answer === 1).length;
    setTetoCount(tCount);

    let key: 'teto' | 'egen' | 'balance';
    if (tCount >= 7) key = 'teto';
    else if (eCount >= 7) key = 'egen';
    else key = 'balance';

    setResultKey(key);
    setPhase('result');
    saveResult(key, tCount, eCount);
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

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);
  const result = resultKey ? RESULTS[resultKey] : null;

  // ── 인트로 ───────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <ToolShell
        eyebrow="Personality Snapshot"
        title="테토에겐 테스트"
        description="주도적인 에너지 발산형인지, 차분한 에너지 충전형인지 빠르게 가늠하는 짧은 진단입니다. 결과를 가볍게 소비하는 카드 UI 대신, 응답 흐름이 보이도록 정리했습니다."
        badges={['11 Questions', '2~3 Minutes', 'Quick Result']}
        meta={[
          { label: 'Format', value: '11개 질문 · 2지선다' },
          { label: 'Output', value: '테토형 · 에겐형 · 균형형' },
          { label: 'Best for', value: '빠른 성향 체크와 공유' },
        ]}
        main={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>성향 기준</h2>
                <p className={styles.sectionDescription}>둘 중 하나가 더 우월한 개념이 아니라, 에너지를 쓰는 방식의 차이로 읽는 테스트입니다.</p>
              </div>
            </div>
            <div className={styles.grid2}>
              <div className={styles.splitItem}>
                <strong>테토형</strong>
                <p className={styles.sectionDescription} style={{ marginTop: 8 }}>
                  활발하고 주도적인 에너지 발산형. 먼저 다가가고 직접적으로 표현합니다.
                </p>
              </div>
              <div className={styles.splitItem}>
                <strong>에겐형</strong>
                <p className={styles.sectionDescription} style={{ marginTop: 8 }}>
                  차분하고 신중한 에너지 충전형. 깊게 관찰하고 세심하게 반응합니다.
                </p>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.buttonPrimary} onClick={startQuiz}>
                테스트 시작하기
              </button>
            </div>
          </section>
        }
        side={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>진행 안내</h2>
                <p className={styles.sectionDescription}>모든 질문은 직감적으로 답하는 편이 결과 해석이 쉽습니다.</p>
              </div>
            </div>
            <div className={styles.splitCard}>
              {[
                '총 11개 질문, 2~3분 안에 끝납니다.',
                '질문 수가 적은 만큼 애매할 때는 평소 습관 기준으로 고르세요.',
                '결과는 재미 요소가 강하지만 저장 데이터로도 남습니다.',
              ].map((item) => (
                <div className={styles.splitItem} key={item}>{item}</div>
              ))}
            </div>
          </section>
        }
      />
    );
  }

  // ── 퀴즈 ─────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    return (
      <ToolShell
        eyebrow="Personality Snapshot"
        title="테토에겐 테스트"
        description="MBTI처럼 문항별로 바로 선택하고 한 번에 결과를 확인하는 방식으로 바꿨습니다."
        badges={['11 Questions', 'Binary Choice', 'One Page']}
        meta={[
          { label: 'Progress', value: `${progress}% 완료` },
          { label: 'Answered', value: `${answeredCount}/${QUESTIONS.length}` },
          { label: 'Mode', value: '문항별 즉시 선택' },
        ]}
        main={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>질문 목록</h2>
                <p className={styles.sectionDescription}>각 문항에서 더 가까운 쪽을 바로 고르면 됩니다. 탭 이동 없이 연속으로 체크할 수 있습니다.</p>
              </div>
            </div>

            <div className={styles.progressTrack} style={{ marginBottom: 18 }}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.stack}>
              {QUESTIONS.map((question, questionIndex) => (
                <article
                  key={question.question}
                  className={styles.splitItem}
                  style={{
                    display: 'grid',
                    gap: 14,
                    borderColor: 'rgba(69, 101, 149, 0.18)',
                    background: 'rgba(255,255,255,0.68)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>
                      Q{questionIndex + 1}
                    </div>
                    <p className={styles.sectionDescription} style={{ marginTop: 8, color: '#11243d', fontWeight: 700 }}>
                      {question.question}
                    </p>
                  </div>

                  <div className={styles.stack}>
                    <OptionButton
                      text={question.options[0]}
                      selected={answers[questionIndex] === 0}
                      onClick={() => handleSelect(questionIndex, 0)}
                    />
                    <OptionButton
                      text={question.options[1]}
                      selected={answers[questionIndex] === 1}
                      onClick={() => handleSelect(questionIndex, 1)}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                className={answeredCount === QUESTIONS.length ? styles.buttonPrimary : styles.buttonGhost}
                onClick={handleSubmitQuiz}
                disabled={answeredCount !== QUESTIONS.length}
              >
                결과 보기
              </button>
            </div>
          </section>
        }
        side={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>응답 팁</h2>
                <p className={styles.sectionDescription}>사교성 하나만 보지 말고 갈등, 발표, 연락 습관까지 같이 생각하세요.</p>
              </div>
            </div>
            <div className={styles.splitCard}>
              {[
                '둘 다 맞는 것 같아도 더 자주 나오는 쪽을 고르면 됩니다.',
                '최근 일주일보다 평소 패턴 기준이 안정적입니다.',
              ].map((item) => (
                <div className={styles.splitItem} key={item}>{item}</div>
              ))}
            </div>
          </section>
        }
      />
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
      <ToolShell
        eyebrow="Personality Snapshot"
        title={result.label}
        description={result.desc}
        badges={[saving ? 'Saving...' : saved ? 'Saved' : 'Result Ready']}
        meta={[
          { label: 'Teto score', value: `${tetoCount}점 · ${tetoPct}%` },
          { label: 'Egen score', value: `${egenCount}점 · ${100 - tetoPct}%` },
          { label: 'Result key', value: resultKey },
        ]}
        main={
          <div className={styles.stack}>
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>성향 분포</h2>
                  <p className={styles.sectionDescription}>한쪽으로 강하게 기울었는지, 균형형인지 한 번에 읽을 수 있습니다.</p>
                </div>
              </div>
              <div style={{ marginBottom: 10, color: accentColor, fontWeight: 700 }}>{result.emoji} {result.label}</div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${tetoPct}%`, background: 'linear-gradient(90deg, #ea580c, #fb923c)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13 }}>
                <span style={{ color: '#ea580c', fontWeight: 700 }}>테토 {tetoPct}%</span>
                <span style={{ color: '#516681', fontWeight: 700 }}>에겐 {100 - tetoPct}%</span>
              </div>
            </section>

            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>핵심 특성</h2>
                  <p className={styles.sectionDescription}>결과 문장을 해시태그처럼 읽기 쉽게 정리했습니다.</p>
                </div>
              </div>
              <div className={styles.badgeRow}>
                {result.traits.map((trait) => (
                  <span className={styles.badge} key={trait}>{trait}</span>
                ))}
              </div>
              <div className={styles.splitItem} style={{ marginTop: 16, borderColor: accentBorder, background: accentBg }}>
                <strong style={{ color: accentColor }}>궁합 팁</strong>
                <p className={styles.sectionDescription} style={{ marginTop: 8 }}>{result.tip}</p>
              </div>
            </section>
          </div>
        }
        side={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>다시 테스트</h2>
                <p className={styles.sectionDescription}>기분 상태에 따라 결과가 달라질 수 있으니 나중에 다시 비교해 볼 수 있습니다.</p>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.buttonPrimary} onClick={startQuiz}>
                다시 테스트하기
              </button>
            </div>
          </section>
        }
      />
    );
  }

  return null;
}
