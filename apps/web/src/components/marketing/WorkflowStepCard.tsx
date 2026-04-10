import type { WorkflowStepCardProps } from './marketing.types';
import styles from '@/app/home.module.css';

export function WorkflowStepCard({ item }: WorkflowStepCardProps) {
  return (
    <article className={styles.workflowCard}>
      <span className={styles.workflowStep}>{item.step}</span>
      <h3>{item.title}</h3>
      <p>{item.copy}</p>
    </article>
  );
}
