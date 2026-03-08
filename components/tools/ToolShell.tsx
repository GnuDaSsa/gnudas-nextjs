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
  meta = [],
  main,
  side,
}: ToolShellProps) {
  const hasSide = meta.length > 0 || Boolean(side);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <div className={styles.eyebrow}>{eyebrow}</div>
            <h1 className={styles.title}>{title}</h1>
          </div>

          {meta.length > 0 ? (
            <aside className={styles.heroSide}>
              <div className={styles.metaList}>
                {meta.slice(0, 2).map((item) => (
                  <div className={styles.metaCard} key={item.label}>
                    <span className={styles.metaLabel}>{item.label}</span>
                    <strong className={styles.metaValue}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </aside>
          ) : null}
        </section>

        <section className={hasSide ? styles.content : styles.contentSingle}>
          <div className={styles.contentMain}>{main}</div>
          {hasSide ? <div className={styles.contentSide}>{side}</div> : null}
        </section>
      </div>
    </div>
  );
}

export { styles as toolShellStyles };
