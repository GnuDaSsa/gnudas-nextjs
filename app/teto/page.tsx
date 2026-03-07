'use client';

import { useState } from 'react';

import { ToolShell, toolShellStyles as styles } from '@/components/tools/ToolShell';

type GenderKey = 'male' | 'female';
type EnergyKey = 'teto' | 'egen';
type ResultKey = 'teto_male' | 'egen_male' | 'teto_female' | 'egen_female';

interface TetoQuestion {
  question: string;
  options: [string, string];
}

const QUESTIONS: TetoQuestion[] = [
  {
    question: '호감 가는 사람이 생기면 먼저 분위기를 만든다.',
    options: ['가볍게 말을 걸거나 약속을 잡는다', '상대 반응을 보면서 천천히 거리를 좁힌다'],
  },
  {
    question: '썸 단계에서 나는...',
    options: ['답답한 텐션보다 직진형이 편하다', '은근한 텐션과 여지를 두는 쪽이 편하다'],
  },
  {
    question: '연락 스타일은...',
    options: ['생각나면 바로 보내고 답도 빠른 편이다', '생각을 정리해서 보내고 템포도 일정하다'],
  },
  {
    question: '모임에서 내 존재감은...',
    options: ['분위기를 띄우거나 대화를 리드하는 쪽이다', '필요할 때 한마디씩 핵심을 짚는 쪽이다'],
  },
  {
    question: '칭찬을 받을 때 더 자연스러운 건...',
    options: ['대놓고 표현받는 것이 좋다', '은근하게 알아봐 주는 것이 좋다'],
  },
  {
    question: '스타일 취향은 대체로...',
    options: ['또렷하고 포인트 있는 인상이 좋다', '부드럽고 정돈된 인상이 좋다'],
  },
  {
    question: '갈등 상황에서 나는...',
    options: ['불편해도 빨리 꺼내서 정리하려 한다', '조금 더 보고 신중하게 말하려 한다'],
  },
  {
    question: '좋아하는 사람 앞에서 나는...',
    options: ['티가 나는 편이고 반응도 빠르다', '티를 덜 내지만 오래 지켜보는 편이다'],
  },
  {
    question: '데이트를 잡을 때는...',
    options: ['내가 먼저 제안하고 흐름을 만든다', '상대 제안을 보고 맞춰가는 편이다'],
  },
  {
    question: '에너지 충전 방식은...',
    options: ['밖으로 움직이면서 풀어낸다', '혼자 정리하며 천천히 회복한다'],
  },
  {
    question: '첫인상으로 더 자주 듣는 말은...',
    options: ['시원시원하고 당당해 보인다', '차분하고 부드러워 보인다'],
  },
  {
    question: '관계에서 더 중요한 것은...',
    options: ['확실한 표현과 분명한 액션', '안정감과 섬세한 배려'],
  },
];

interface ResultInfo {
  label: string;
  emoji: string;
  desc: string;
  traits: string[];
  tip: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
}

const RESULTS: Record<ResultKey, ResultInfo> = {
  teto_male: {
    label: '테토남',
    emoji: '🔥',
    desc: '직진력과 존재감이 강하게 드러나는 타입입니다. 표현이 분명하고 관계의 흐름을 먼저 만드는 편이라, 답답한 텐션보다 명확한 액션에서 매력이 살아납니다.',
    traits: ['직설적 표현', '빠른 리드', '시원한 존재감', '주도적 썸 텐션', '행동 우선형'],
    tip: '강한 추진력이 장점이지만, 상대 템포를 한 박자 읽어주면 매력이 더 오래 갑니다.',
    accent: '#f97316',
    accentSoft: 'rgba(249,115,22,0.12)',
    accentBorder: 'rgba(249,115,22,0.28)',
  },
  egen_male: {
    label: '에겐남',
    emoji: '🌙',
    desc: '부드럽고 안정적인 매력을 주는 타입입니다. 앞에 나서기보다 분위기를 읽고 타이밍을 보는 편이라, 서서히 신뢰를 쌓는 관계에서 강점이 큽니다.',
    traits: ['잔잔한 배려', '신중한 접근', '정서적 안정감', '관찰 후 반응', '은근한 매력'],
    tip: '속도가 느리게 보일 수 있으니, 중요한 순간에는 호감 표현을 조금 더 명확히 해주는 편이 좋습니다.',
    accent: '#6366f1',
    accentSoft: 'rgba(99,102,241,0.12)',
    accentBorder: 'rgba(99,102,241,0.28)',
  },
  teto_female: {
    label: '테토녀',
    emoji: '⚡',
    desc: '밝고 선명한 에너지가 먼저 보이는 타입입니다. 감정 표현과 리액션이 분명하고, 관계에서도 끌리면 끌린다고 보여주는 편이라 존재감이 강합니다.',
    traits: ['밝은 리액션', '직진형 호감 표현', '또렷한 스타일', '선명한 분위기', '주도적 관계감'],
    tip: '센 인상으로만 읽히지 않도록, 세심함이 보이는 순간을 같이 만들어주면 밸런스가 좋아집니다.',
    accent: '#ec4899',
    accentSoft: 'rgba(236,72,153,0.12)',
    accentBorder: 'rgba(236,72,153,0.28)',
  },
  egen_female: {
    label: '에겐녀',
    emoji: '🫧',
    desc: '부드럽고 섬세한 결이 매력인 타입입니다. 천천히 가까워지면서도 정서적 밀도를 쌓는 데 강해, 오래 볼수록 편안함과 깊이가 살아나는 쪽입니다.',
    traits: ['섬세한 배려', '은근한 텐션', '정돈된 무드', '깊게 스며드는 매력', '안정감 있는 관계'],
    tip: '조심스러움이 너무 길어지면 신호가 약해 보일 수 있으니, 결정적 순간에는 확실한 표현이 필요합니다.',
    accent: '#14b8a6',
    accentSoft: 'rgba(20,184,166,0.12)',
    accentBorder: 'rgba(20,184,166,0.28)',
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
      type="button"
      onClick={onClick}
      className={`${styles.optionButton} ${selected ? styles.optionButtonSelected : ''}`}
    >
      {text}
    </button>
  );
}

export default function TetoPage() {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [gender, setGender] = useState<GenderKey | null>(null);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [resultKey, setResultKey] = useState<ResultKey | null>(null);
  const [tetoCount, setTetoCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function startQuiz() {
    if (!gender) {
      return;
    }

    setAnswers(Array.from({ length: QUESTIONS.length }, () => null));
    setResultKey(null);
    setSaved(false);
    setPhase('quiz');
  }

  function handleSelect(questionIndex: number, optionIndex: number) {
    setAnswers((prev) => prev.map((value, index) => (index === questionIndex ? optionIndex : value)));
  }

  function resolveResultKey(selectedGender: GenderKey, dominantEnergy: EnergyKey) {
    if (selectedGender === 'male') {
      return dominantEnergy === 'teto' ? 'teto_male' : 'egen_male';
    }

    return dominantEnergy === 'teto' ? 'teto_female' : 'egen_female';
  }

  function handleSubmitQuiz() {
    if (!gender || answers.some((answer) => answer === null)) {
      return;
    }

    const resolvedAnswers = answers as number[];
    const tCount = resolvedAnswers.filter((answer) => answer === 0).length;
    const eCount = resolvedAnswers.filter((answer) => answer === 1).length;
    const dominantEnergy: EnergyKey = tCount >= eCount ? 'teto' : 'egen';
    const key = resolveResultKey(gender, dominantEnergy);

    setTetoCount(tCount);
    setResultKey(key);
    setPhase('result');
    saveResult(key, gender, tCount, eCount, dominantEnergy);
  }

  async function saveResult(
    key: ResultKey,
    selectedGender: GenderKey,
    tCount: number,
    eCount: number,
    dominantEnergy: EnergyKey,
  ) {
    setSaving(true);
    try {
      await fetch('/api/teto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result: key,
          gender: selectedGender,
          dominantEnergy,
          tetoScore: tCount,
          egenScore: eCount,
        }),
      });
      setSaved(true);
    } catch {
      // 저장 실패는 무시한다.
    } finally {
      setSaving(false);
    }
  }

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);
  const result = resultKey ? RESULTS[resultKey] : null;

  if (phase === 'intro') {
    return (
      <ToolShell
        eyebrow="Personality Snapshot"
        title="테토에겐 테스트"
        description="국내 밈에서 주로 쓰이는 `테토남 · 에겐남 · 테토녀 · 에겐녀` 4분류 기준으로 다시 정리했습니다. 주도성, 표현 방식, 썸 텐션, 무드 선호를 중심으로 빠르게 판별합니다."
        badges={['12 Questions', '4 Results', 'Trend-based']}
        meta={[
          { label: 'Format', value: '12개 질문 · 2지선다' },
          { label: 'Output', value: '테토남 · 에겐남 · 테토녀 · 에겐녀' },
          { label: 'Need', value: '시작 전 성별 선택' },
        ]}
        main={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>시작 전 선택</h2>
                <p className={styles.sectionDescription}>
                  결과가 4유형으로 갈리기 때문에 먼저 기준 성별을 선택합니다.
                </p>
              </div>
            </div>

            <div className={styles.grid2}>
              {([
                { key: 'male', label: '남성 기준', desc: '결과를 테토남 / 에겐남으로 계산' },
                { key: 'female', label: '여성 기준', desc: '결과를 테토녀 / 에겐녀로 계산' },
              ] as const).map((item) => {
                const active = gender === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setGender(item.key)}
                    className={styles.splitItem}
                    style={{
                      textAlign: 'left',
                      borderColor: active ? 'rgba(37,99,235,0.44)' : 'rgba(69, 101, 149, 0.18)',
                      background: active
                        ? 'linear-gradient(180deg, rgba(37,99,235,0.10), rgba(124,58,237,0.08))'
                        : 'rgba(255,255,255,0.72)',
                    }}
                  >
                    <strong style={{ color: active ? '#1d4ed8' : '#11243d' }}>{item.label}</strong>
                    <p className={styles.sectionDescription} style={{ marginTop: 8 }}>
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className={styles.actions}>
              <button
                className={gender ? styles.buttonPrimary : styles.buttonGhost}
                onClick={startQuiz}
                disabled={!gender}
              >
                테스트 시작하기
              </button>
            </div>
          </section>
        }
        side={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>판별 기준</h2>
                <p className={styles.sectionDescription}>
                  웹상에서 반복적으로 언급되는 차이를 바탕으로 질문 축을 정리했습니다.
                </p>
              </div>
            </div>
            <div className={styles.splitCard}>
              {[
                '테토: 직진, 존재감, 선명한 표현, 리드 성향',
                '에겐: 부드러움, 관찰, 안정감, 은근한 텐션',
                '연애/썸 맥락에서의 행동 차이를 질문 비중에 반영',
              ].map((item) => (
                <div className={styles.splitItem} key={item}>{item}</div>
              ))}
            </div>
          </section>
        }
      />
    );
  }

  if (phase === 'quiz') {
    return (
      <ToolShell
        eyebrow="Personality Snapshot"
        title="테토에겐 테스트"
        description="문항별로 바로 선택하고 한 번에 결과를 확인합니다. 질문 수는 12개로 유지했습니다."
        badges={['12 Questions', 'Binary Choice', 'One Page']}
        meta={[
          { label: 'Progress', value: `${progress}% 완료` },
          { label: 'Answered', value: `${answeredCount}/${QUESTIONS.length}` },
          { label: 'Track', value: gender === 'male' ? '남성 기준' : '여성 기준' },
        ]}
        main={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>질문 목록</h2>
                <p className={styles.sectionDescription}>
                  최근 밈 문맥에 맞게 썸, 표현, 리드, 무드 선호 질문을 섞었습니다.
                </p>
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
                <p className={styles.sectionDescription}>
                  내가 되고 싶은 모습보다 실제로 자주 나오는 반응을 기준으로 고르는 편이 정확합니다.
                </p>
              </div>
            </div>
            <div className={styles.splitCard}>
              {[
                '썸이나 호감 상황에서의 평소 반응을 떠올리기',
                '최근 하루 기분보다 기본 텐션을 기준으로 답하기',
                '애매하면 더 자주 먼저 하는 행동 쪽을 선택하기',
              ].map((item) => (
                <div className={styles.splitItem} key={item}>{item}</div>
              ))}
            </div>
          </section>
        }
      />
    );
  }

  if (phase === 'result' && result && resultKey) {
    const egenCount = QUESTIONS.length - tetoCount;
    const tetoPct = Math.round((tetoCount / QUESTIONS.length) * 100);

    return (
      <ToolShell
        eyebrow="Personality Snapshot"
        title={result.label}
        description={result.desc}
        badges={[saving ? 'Saving...' : saved ? 'Saved' : 'Result Ready']}
        meta={[
          { label: 'Teto score', value: `${tetoCount}점 · ${tetoPct}%` },
          { label: 'Egen score', value: `${egenCount}점 · ${100 - tetoPct}%` },
          { label: 'Track', value: gender === 'male' ? '남성 기준' : '여성 기준' },
        ]}
        main={
          <div className={styles.stack}>
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>성향 분포</h2>
                  <p className={styles.sectionDescription}>
                    한쪽으로 얼마나 기울었는지 바로 읽을 수 있게 정리했습니다.
                  </p>
                </div>
              </div>
              <div style={{ marginBottom: 10, color: result.accent, fontWeight: 700 }}>
                {result.emoji} {result.label}
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${tetoPct}%`, background: `linear-gradient(90deg, ${result.accent}, #facc15)` }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13 }}>
                <span style={{ color: result.accent, fontWeight: 700 }}>테토 {tetoPct}%</span>
                <span style={{ color: '#516681', fontWeight: 700 }}>에겐 {100 - tetoPct}%</span>
              </div>
            </section>

            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>핵심 특성</h2>
                  <p className={styles.sectionDescription}>
                    밈에서 소비되는 이미지와 실제 응답 패턴이 겹치는 지점을 키워드로 정리했습니다.
                  </p>
                </div>
              </div>
              <div className={styles.badgeRow}>
                {result.traits.map((trait) => (
                  <span className={styles.badge} key={trait}>{trait}</span>
                ))}
              </div>
              <div
                className={styles.splitItem}
                style={{ marginTop: 16, borderColor: result.accentBorder, background: result.accentSoft }}
              >
                <strong style={{ color: result.accent }}>관계 팁</strong>
                <p className={styles.sectionDescription} style={{ marginTop: 8 }}>
                  {result.tip}
                </p>
              </div>
            </section>
          </div>
        }
        side={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>다시 테스트</h2>
                <p className={styles.sectionDescription}>
                  성별 기준을 바꿔 비교해 보거나, 나중에 다시 해도 됩니다.
                </p>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.buttonPrimary} onClick={() => setPhase('intro')}>
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
