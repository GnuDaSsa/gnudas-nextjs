'use client';

import { FormEvent, useState } from 'react';

import { ToolShell, toolShellStyles as styles } from '@/components/tools/ToolShell';

type ApiResponse = {
  profile: {
    name: string;
    birthDate: string;
    birthTime: string;
    pillars: { label: string; text: string; elements: string[] }[];
    dominantElement: { label: string; description: string };
    supportElement: { label: string; description: string };
    cautiousElement: { label: string; description: string };
    summary: string;
    disclaimer: string;
  };
  history: {
    source: string;
    drawCount: number;
    latestDrawNo: number;
    latestDrawDate: string;
    hotNumbers: number[];
    coldNumbers: number[];
    recentDraws: { drawNo: number; date: string; numbers: number[]; bonusNo: number }[];
  };
  target: {
    drawNo: number;
    dateLabel: string;
  };
  tickets: { numbers: number[]; angle: string; emphasis: string }[];
};

const INITIAL_FORM = {
  name: '',
  birthDate: '',
  birthTime: '12:00',
  ticketCount: '5',
};

function NumberBall({ num, accent = false }: { num: number; accent?: boolean }) {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: '999px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 15,
        color: accent ? '#fff' : '#0f2240',
        background: accent
          ? 'linear-gradient(135deg, #1d4ed8, #7c3aed)'
          : 'linear-gradient(135deg, #fff, #dbeafe)',
        border: accent ? '1px solid rgba(59,130,246,0.36)' : '1px solid rgba(59,130,246,0.18)',
        boxShadow: accent
          ? '0 10px 24px rgba(59,130,246,0.24)'
          : '0 8px 18px rgba(15, 35, 70, 0.08)',
      }}
    >
      {num}
    </span>
  );
}

export default function LottoSajuPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/lotto-saju', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          birthDate: form.birthDate,
          birthTime: form.birthTime || undefined,
          ticketCount: Number(form.ticketCount),
        }),
      });

      const data = (await response.json()) as ApiResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || '번호를 생성하지 못했습니다.');
      }

      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '요청 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      eyebrow="Fun Lab"
      title="사주 로또 추출기"
      description="양력 생년월일과 시간을 기준으로 간지·오행 흐름을 가볍게 추정하고, 최근 로또 회차 기록의 빈도/냉각 구간을 합쳐 이번 주용 번호 세트를 뽑아주는 엔터테인먼트 실험입니다."
      badges={['사주명리 모티프', '최근 회차 히스토리 반영', '이번 주 추천 세트']}
      meta={[
        { label: 'Target', value: result ? `${result.target.drawNo}회 · ${result.target.dateLabel}` : '입력 후 계산' },
        { label: 'History', value: result ? `${result.history.drawCount.toLocaleString()}개 회차 분석` : '외부 히스토리 로드 대기' },
        { label: 'Mode', value: 'For Fun / Entertainment' },
      ]}
      main={
        <div className={styles.stack}>
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>사주 정보 입력</h2>
                <p className={styles.sectionDescription}>
                  음력 변환 없이 양력 기준으로 빠르게 계산합니다. 시간 미상인 경우 정오 기준으로 계산됩니다.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.grid2}>
                <label>
                  <span className={styles.label}>이름 또는 별칭</span>
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="예: 동주"
                  />
                </label>

                <label>
                  <span className={styles.label}>추천 세트 수</span>
                  <select
                    className={styles.select}
                    value={form.ticketCount}
                    onChange={(event) => setForm((prev) => ({ ...prev, ticketCount: event.target.value }))}
                  >
                    {[3, 4, 5, 6, 7].map((count) => (
                      <option key={count} value={count}>
                        {count}세트
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className={styles.label}>생년월일</span>
                  <input
                    required
                    type="date"
                    className={styles.input}
                    value={form.birthDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                  />
                </label>

                <label>
                  <span className={styles.label}>출생 시간</span>
                  <input
                    type="time"
                    className={styles.input}
                    value={form.birthTime}
                    onChange={(event) => setForm((prev) => ({ ...prev, birthTime: event.target.value }))}
                  />
                </label>
              </div>

              <div className={styles.actions}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    border: 'none',
                    borderRadius: 18,
                    padding: '13px 18px',
                    background: 'linear-gradient(135deg, #0f172a, #2563eb)',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: loading ? 'wait' : 'pointer',
                  }}
                >
                  {loading ? '계산 중...' : '이번 주 번호 뽑기'}
                </button>
              </div>

              {error ? (
                <p style={{ marginTop: 14, color: '#b91c1c', fontSize: 14 }}>
                  {error}
                </p>
              ) : null}
            </form>
          </section>

          {result ? (
            <>
              <section className={styles.surface}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>사주 해석 요약</h2>
                    <p className={styles.sectionDescription}>{result.profile.summary}</p>
                  </div>
                </div>

                <div className={styles.grid3}>
                  {[
                    ['주요 오행', `${result.profile.dominantElement.label} · ${result.profile.dominantElement.description}`],
                    ['보조 오행', `${result.profile.supportElement.label} · ${result.profile.supportElement.description}`],
                    ['주의 오행', `${result.profile.cautiousElement.label} · ${result.profile.cautiousElement.description}`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        borderRadius: 22,
                        padding: 18,
                        background: 'linear-gradient(180deg, rgba(10,23,55,0.96), rgba(31,41,87,0.92))',
                        color: '#eef4ff',
                      }}
                    >
                      <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#93c5fd' }}>
                        {label}
                      </div>
                      <div style={{ marginTop: 10, fontSize: 18, fontWeight: 800, lineHeight: 1.4 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  {result.profile.pillars.map((pillar) => (
                    <div
                      key={pillar.label}
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        border: '1px solid rgba(59,130,246,0.14)',
                        background: 'rgba(255,255,255,0.72)',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        {pillar.label}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800 }}>{pillar.text}</div>
                      <div style={{ marginTop: 4, fontSize: 13, color: '#475569' }}>{pillar.elements.join(' / ')}</div>
                    </div>
                  ))}
                </div>

                <p style={{ marginTop: 16, color: '#64748b', fontSize: 13, lineHeight: 1.7 }}>
                  {result.profile.disclaimer}
                </p>
              </section>

              <section className={styles.surface}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>이번 주 추천 번호</h2>
                    <p className={styles.sectionDescription}>
                      {result.target.drawNo}회차 ({result.target.dateLabel}) 기준으로 생성된 조합입니다.
                    </p>
                  </div>
                </div>

                <div className={styles.stack}>
                  {result.tickets.map((ticket, index) => (
                    <article
                      key={ticket.numbers.join('-')}
                      style={{
                        borderRadius: 24,
                        padding: 20,
                        background: index % 2 === 0
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(219,234,254,0.76))'
                          : 'linear-gradient(135deg, rgba(239,246,255,0.96), rgba(224,231,255,0.78))',
                        border: '1px solid rgba(59,130,246,0.14)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>
                            Set {index + 1}
                          </div>
                          <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>{ticket.angle}</div>
                        </div>
                        <div style={{ fontSize: 13, color: '#475569' }}>{ticket.emphasis}</div>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                        {ticket.numbers.map((num) => (
                          <NumberBall key={num} num={num} />
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>결과 미리보기</h2>
                  <p className={styles.sectionDescription}>
                    계산을 실행하면 사주 요약, 최근 회차 히스토리, 추천 번호 세트가 여기에 표시됩니다.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      }
      side={
        <div className={styles.stack}>
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>참고 방식</h2>
                <p className={styles.sectionDescription}>
                  사주 모티프와 회차 기록을 함께 섞어 가중치를 만듭니다.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                '생년월일/시간으로 연·월·일·시의 간지와 오행 성향을 추정',
                '최근 12회와 52회 번호 빈도를 동시에 반영',
                '오랫동안 안 나온 냉번호에 약한 반등 가중치 부여',
                '합계, 홀짝, 연속수 편중을 피하도록 조합 필터링',
              ].map((line) => (
                <div
                  key={line}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.76)',
                    color: '#334155',
                    lineHeight: 1.7,
                    fontSize: 14,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>최근 회차</h2>
                <p className={styles.sectionDescription}>
                  {result
                    ? `${result.history.latestDrawNo}회차까지 반영`
                    : '생성 후 최근 회차 8개가 노출됩니다.'}
                </p>
              </div>
            </div>

            {result ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))',
                    color: '#eff6ff',
                  }}
                >
                  <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#93c5fd' }}>
                    Hot Numbers
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {result.history.hotNumbers.map((num) => (
                      <NumberBall key={`hot-${num}`} num={num} accent />
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: 'rgba(255,255,255,0.8)',
                  }}
                >
                  <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>
                    Cold Numbers
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {result.history.coldNumbers.map((num) => (
                      <NumberBall key={`cold-${num}`} num={num} />
                    ))}
                  </div>
                </div>

                {result.history.recentDraws.map((draw) => (
                  <div
                    key={draw.drawNo}
                    style={{
                      padding: 16,
                      borderRadius: 18,
                      border: '1px solid rgba(59,130,246,0.12)',
                      background: 'rgba(255,255,255,0.76)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, color: '#64748b' }}>
                      <span>{draw.drawNo}회</span>
                      <span>{draw.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      {draw.numbers.map((num) => (
                        <NumberBall key={`${draw.drawNo}-${num}`} num={num} />
                      ))}
                      <NumberBall num={draw.bonusNo} accent />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      }
    />
  );
}
