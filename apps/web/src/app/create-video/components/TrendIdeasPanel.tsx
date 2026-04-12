import type { TrendIdeasPanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function TrendIdeasPanel({ trendIdeas }: TrendIdeasPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="trend-engine-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Trends</p>
          <h3 className={styles.toolTitle} id="trend-engine-title">
            Trending
          </h3>
        </div>
      </div>

      <div className={styles.progressList}>
        {trendIdeas.map((trendIdea) => (
          <article className={styles.progressCard} key={trendIdea.topic}>
            <strong>{trendIdea.topic}</strong>
            <p className={styles.previewPrompt}>{trendIdea.idea}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
