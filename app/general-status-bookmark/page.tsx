'use client';

import { useState } from 'react';

import { ToolShell, toolShellStyles as styles } from '@/components/tools/ToolShell';

const WORKFLOW_STEPS = [
  'HWP/HWPX 원본을 별도 작업 폴더에 복사합니다.',
  'HWP/OLE 파일이면 한컴으로 ZIP 기반 HWPX로 정규화합니다.',
  '목차 항목을 본문 제목과 매칭해 책갈피와 하이퍼링크를 삽입합니다.',
  '책갈피 대상 누락 여부를 검사한 뒤 한컴으로 PDF를 내보냅니다.',
  'PDF 페이지를 이미지로 렌더링하고 모바일 목차 뷰어를 생성합니다.',
  '페이지 이미지를 HTML 안에 넣어 모바일 전달용 단일파일 HTML로 마감합니다.',
] as const;

const OUTPUT_RULES = [
  '최종 공유 파일은 단일파일 HTML 하나만 사용합니다.',
  '본문의 목차 복귀 링크는 기본으로 만들지 않습니다.',
  '목차 검색과 페이지 이동은 모바일 HTML 뷰어의 고정 목차 패널이 담당합니다.',
  '중간 산출물인 HWPX, PDF, 이미지 폴더는 검증과 재처리용으로만 보관합니다.',
] as const;

const SKILL_PROMPT = [
  'director-toc-mobile-html 스킬을 사용해서 일반현황 HWP/HWPX를 처리해줘.',
  '목차 책갈피/하이퍼링크를 먼저 만들고, 한컴 PDF 내보내기 후 모바일 전달용 단일파일 HTML까지 생성해줘.',
  '본문 [목차] 복귀 링크는 만들지 말고, 최종 결과는 단일파일 HTML 기준으로 검증해줘.',
].join('\n');

export default function GeneralStatusBookmarkPage() {
  const [copied, setCopied] = useState(false);

  function copyPrompt() {
    void navigator.clipboard.writeText(SKILL_PROMPT).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => setCopied(false),
    );
  }

  return (
    <ToolShell
      eyebrow="Local Document Workflow"
      title="일반현황 모바일 책갈피"
      description="일반현황 HWP/HWPX를 목차 책갈피가 포함된 모바일 단일파일 HTML로 마감하는 로컬 자동화 기준입니다."
      badges={['HWPX Bookmark', 'PDF Image Viewer', 'Single HTML']}
      main={
        <div className={styles.stack}>
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>실행 방식</h2>
                <p className={styles.sectionDescription}>
                  이 페이지는 웹 배포 환경에서 한컴을 직접 실행하지 않습니다. 실제 변환은 Codex에서 스킬 요청으로 실행하고,
                  이 화면은 도구 목록에서 작업 기준과 요청 문구를 고정해 두는 역할입니다.
                </p>
              </div>
              <span className={styles.pill}>Codex Skill</span>
            </div>

            <div className={styles.splitCard}>
              <div className={styles.splitItem}>
                <strong>왜 웹에서 바로 변환하지 않나</strong>
                <p className={styles.sectionDescription}>
                  HWP/HWPX 정규화, 한컴 PDF 내보내기, PDF 이미지 렌더링은 로컬 PC의 한컴 COM과 Python 스크립트가 필요합니다.
                  브라우저 HTML만으로는 이 권한을 사용할 수 없습니다.
                </p>
              </div>
              <div className={styles.splitItem}>
                <strong>최종 사용 기준</strong>
                <p className={styles.sectionDescription}>
                  변환기는 개인 PC에서만 돌리고, 다른 사람에게는 완성된 모바일 단일파일 HTML만 공유합니다.
                </p>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.buttonPrimary} type="button" onClick={copyPrompt}>
                {copied ? '요청 문구 복사됨' : 'Codex 요청 문구 복사'}
              </button>
            </div>
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>처리 순서</h2>
                <p className={styles.sectionDescription}>
                  진행 시간이 긴 구간을 사용자가 알 수 있도록 단계별 상태를 표시하는 기준입니다.
                </p>
              </div>
            </div>

            <div className={styles.splitCard}>
              {WORKFLOW_STEPS.map((step, index) => (
                <div className={styles.splitItem} key={step}>
                  <strong>{String(index + 1).padStart(2, '0')}</strong>
                  <p className={styles.sectionDescription}>{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>산출물 기준</h2>
                <p className={styles.sectionDescription}>
                  모바일 공유가 목적이므로 결과 목록은 단일파일 HTML 중심으로 판단합니다.
                </p>
              </div>
              <span className={styles.pill}>Single HTML</span>
            </div>

            <div className={styles.grid2}>
              {OUTPUT_RULES.map((rule) => (
                <div className={styles.splitItem} key={rule}>
                  <p className={styles.sectionDescription}>{rule}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>스킬 요청 문구</h2>
                <p className={styles.sectionDescription}>
                  자료 경로를 붙여서 Codex에 요청하면 현재 기준으로 책갈피, PDF, 모바일 단일 HTML까지 처리합니다.
                </p>
              </div>
            </div>
            <pre className={styles.codeBlock}>{SKILL_PROMPT}</pre>
          </section>
        </div>
      }
    />
  );
}
