import type { BulkGenerationPanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function BulkGenerationPanel({
  bulkInput,
  onBulkInputChange,
  onBulkFileUpload,
  onGenerateBulk,
  isBulkGenerating,
  onRetryFailedBulkJobs,
  bulkJobs,
  onRetryBulkJob,
  errorMessage,
}: BulkGenerationPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="bulk-generation-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Batch mode</p>
          <h3 className={styles.toolTitle} id="bulk-generation-title">
            Bulk generation
          </h3>
        </div>
        <div className={styles.progressActions}>
          <button
            className={styles.secondaryButton}
            onClick={() => void onGenerateBulk()}
            disabled={isBulkGenerating}
            type="button"
          >
            {isBulkGenerating ? 'Generating...' : 'Generate all'}
          </button>
          <button className={styles.ghostButton} onClick={onRetryFailedBulkJobs} type="button">
            Retry failed only
          </button>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="bulkInput">
          Upload list or paste one product per line
        </label>
        <textarea
          id="bulkInput"
          className={styles.textarea}
          value={bulkInput}
          onChange={(event) => onBulkInputChange(event.target.value)}
        />
      </div>

      <input
        accept=".txt,.csv"
        className={styles.fileInput}
        onChange={(event) => void onBulkFileUpload(event)}
        type="file"
      />

      <p className={styles.toolHint}>Retry only the failed items from the current bulk run.</p>

      <div className={styles.progressList}>
        {bulkJobs.length === 0 ? (
          <div className={styles.noteCard}>Bulk progress will appear here after you queue the list.</div>
        ) : (
          bulkJobs.map((bulkJob) => (
            <article className={styles.progressCard} key={bulkJob.id}>
              <div>
                <p className={styles.hookText}>{bulkJob.productDescription}</p>
                <p className={styles.toolHint}>
                  {bulkJob.status}
                  {bulkJob.videoId ? ` · ${bulkJob.videoId}` : ''}
                </p>
              </div>
              <div className={styles.progressActions}>
                {bulkJob.outputUrl ? (
                  <a className={styles.ghostButton} href={bulkJob.outputUrl} rel="noreferrer" target="_blank">
                    Open
                  </a>
                ) : null}
                {bulkJob.status === 'failed' ? (
                  <button
                    className={styles.ghostButton}
                    onClick={() => void onRetryBulkJob(bulkJob.id)}
                    type="button"
                  >
                    Retry failed
                  </button>
                ) : null}
              </div>
              {bulkJob.errorMessage ? <p className={styles.error}>{bulkJob.errorMessage}</p> : null}
            </article>
          ))
        )}
      </div>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
    </section>
  );
}
