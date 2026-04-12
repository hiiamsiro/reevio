import styles from '../page.module.css';

export interface MonitoringPanelProps {
  readonly failedJobs: number;
  readonly activeJobs: number;
  readonly latestError: string;
}

export function MonitoringPanel({ failedJobs, activeJobs, latestError }: MonitoringPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="monitoring-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Monitoring</p>
          <h3 className={styles.toolTitle} id="monitoring-title">
            Monitoring
          </h3>
        </div>
      </div>

      <div className={styles.scoreGrid}>
        <div className={styles.heroMetric}>
          <span>Failed jobs</span>
          <strong>{failedJobs}</strong>
        </div>
        <div className={styles.heroMetric}>
          <span>Active jobs</span>
          <strong>{activeJobs}</strong>
        </div>
        <div className={styles.heroMetric}>
          <span>System</span>
          <strong>{failedJobs === 0 ? 'Healthy' : 'Attention'}</strong>
        </div>
      </div>

      <div className={styles.progressCard}>
        <strong>Latest error</strong>
        <p className={styles.previewPrompt}>{latestError}</p>
      </div>
    </section>
  );
}
