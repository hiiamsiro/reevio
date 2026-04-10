import type { PerformanceAiPanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function PerformanceAiPanel({
  performanceInsight,
  views,
  onViewsChange,
  likes,
  onLikesChange,
  watchTime,
  onWatchTimeChange,
}: PerformanceAiPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="performance-ai-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Phase 42</p>
          <h3 className={styles.toolTitle} id="performance-ai-title">
            Performance AI
          </h3>
        </div>
        <span className={styles.scoreBadge}>{performanceInsight.health}</span>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="views">
            Views
          </label>
          <input
            id="views"
            className={styles.textInput}
            onChange={(event) => onViewsChange(event.target.value)}
            value={views}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="likes">
            Likes
          </label>
          <input
            id="likes"
            className={styles.textInput}
            onChange={(event) => onLikesChange(event.target.value)}
            value={likes}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="watchTime">
          Average watch time (seconds)
        </label>
        <input
          id="watchTime"
          className={styles.textInput}
          onChange={(event) => onWatchTimeChange(event.target.value)}
          value={watchTime}
        />
      </div>

      <div className={styles.progressCard}>
        <strong>Suggestion</strong>
        <p className={styles.previewPrompt}>{performanceInsight.suggestion}</p>
      </div>
    </section>
  );
}
