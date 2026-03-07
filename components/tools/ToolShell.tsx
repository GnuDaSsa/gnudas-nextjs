import type { ReactNode } from 'react';

import styles from './tool-shell.module.css';

type MetaItem = {
  label: string;
  value: string;
};

interface ToolShellProps {
  eyebrow: string;
  title: string;
  description: string;
  badges?: string[];
  meta?: MetaItem[];
  main: ReactNode;
  side?: ReactNode;
}

export function ToolShell({
  eyebrow,
  title,
  description,
  badges = [],
  meta = [],
  main,
  side,
}: ToolShellProps) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <div className={styles.eyebrow}>{eyebrow}</div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lead}>{description}</p>
            {badges.length > 0 ? (
              <div className={styles.badgeRow}>
                {badges.map((badge) => (
                  <span className={styles.badge} key={badge}>
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <aside className={styles.heroSide}>
            <div className={styles.metaList}>
              {meta.map((item) => (
                <div className={styles.metaCard} key={item.label}>
                  <span className={styles.metaLabel}>{item.label}</span>
                  <strong className={styles.metaValue}>{item.value}</strong>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className={styles.content}>
          <div className={styles.contentMain}>{main}</div>
          <div className={styles.contentSide}>{side}</div>
        </section>
      </div>
    </div>
  );
}

export { styles as toolShellStyles };
