import styles from '../page.module.css';

export interface StorageCdnPanelProps {
  readonly storageUrl: string;
  readonly onCopyStorageUrl: () => void;
}

export function StorageCdnPanel({ storageUrl, onCopyStorageUrl }: StorageCdnPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="storage-cdn-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Storage</p>
          <h3 className={styles.toolTitle} id="storage-cdn-title">
            Storage + CDN
          </h3>
        </div>
        <button className={styles.ghostButton} onClick={onCopyStorageUrl} type="button">
          Copy URL
        </button>
      </div>

      <div className={styles.progressCard}>
        <strong>Delivery URL</strong>
        <p className={styles.previewPrompt}>{storageUrl}</p>
        <div className={styles.tagList}>
          <span className={styles.metaBadge}>Fast load</span>
          <span className={styles.metaBadge}>Secure access</span>
          <span className={styles.metaBadge}>CDN edge ready</span>
        </div>
      </div>
    </section>
  );
}
