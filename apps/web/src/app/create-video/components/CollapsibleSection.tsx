import { useState } from 'react';
import styles from './CollapsibleSection.module.css';

interface CollapsibleSectionProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly defaultOpen?: boolean;
  readonly children: React.ReactNode;
}

export function CollapsibleSection({
  eyebrow,
  title,
  description,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details className={styles.root} open={isOpen}>
      <summary
        className={styles.trigger}
        title={description}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
      >
        <div className={styles.triggerLeft}>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <div className={styles.triggerCopy}>
            <span className={styles.title}>{title}</span>
            {description ? <span className={styles.description}>{description}</span> : null}
          </div>
        </div>
        <span className={styles.badge}>{isOpen ? 'Hide' : 'Show'}</span>
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
