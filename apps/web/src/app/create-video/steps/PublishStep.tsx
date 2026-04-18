import type {
  ExportFormatDefinition,
  ExportFormatId,
  PostingPreparation,
} from '../content-studio';
import { ExportPanel, PostingPreparationPanel } from '../components';
import styles from '../page.module.css';

export interface PublishStepProps {
  readonly prompt: string;
  readonly exportFormats: readonly ExportFormatDefinition[];
  readonly selectedExportFormatId: ExportFormatId;
  readonly onSelectExportFormat: (formatId: ExportFormatId) => void;
  readonly onDownloadFormat: (format: ExportFormatDefinition) => void;
  readonly onDownloadAllFormats: () => void;
  readonly postingPreparation: PostingPreparation;
  readonly onRegeneratePostingPreparation: () => void;
  readonly onCopyPostingField: (label: string, value: string) => void;
  readonly onUpdatePostingPreparation: (
    field: keyof PostingPreparation,
    value: string
  ) => void;
  readonly postingNotice: string | null;
  readonly outputUrl: string | null;
  readonly onCopyOutputUrl: () => void;
}

export function PublishStep({
  prompt,
  exportFormats,
  selectedExportFormatId,
  onSelectExportFormat,
  onDownloadFormat,
  onDownloadAllFormats,
  postingPreparation,
  onRegeneratePostingPreparation,
  onCopyPostingField,
  onUpdatePostingPreparation,
  postingNotice,
  outputUrl,
  onCopyOutputUrl,
}: PublishStepProps) {
  const selectedExportFormat =
    exportFormats.find((format) => format.id === selectedExportFormatId) ??
    exportFormats[0];
  const promptSnippet =
    prompt.trim().length > 100
      ? `${prompt.trim().slice(0, 97).trimEnd()}...`
      : prompt.trim();

  return (
    <>
      <div className={styles.publishOverview}>
        <article className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Output status</span>
          <strong>{outputUrl ? 'Ready to package' : 'Waiting for render'}</strong>
          <span className={styles.overviewMeta}>
            {outputUrl
              ? 'Your render is available for export briefs and posting copy.'
              : 'Finish the render step first to unlock the export package.'}
          </span>
        </article>
        <article className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Preview headline</span>
          <strong>{selectedExportFormat.previewHeadline}</strong>
          <span className={styles.overviewMeta}>
            Export preview and posting title are generated from the current brief.
          </span>
        </article>
        <article className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Format focus</span>
          <strong>{selectedExportFormat.label}</strong>
          <span className={styles.overviewMeta}>{selectedExportFormat.canvas}</span>
        </article>
        <article className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Current brief</span>
          <strong>{promptSnippet || 'No brief provided'}</strong>
          <span className={styles.overviewMeta}>
            Export briefs are built from the latest prompt state.
          </span>
        </article>
      </div>

      <div className={styles.publishLayout}>
        <div className={styles.primaryColumn}>
          <ExportPanel
            exportFormats={exportFormats}
            selectedExportFormat={selectedExportFormat}
            onSelectExportFormat={onSelectExportFormat}
            onDownloadAllFormats={onDownloadAllFormats}
            onDownloadFormat={onDownloadFormat}
          />
          <PostingPreparationPanel
            onCopyPostingField={onCopyPostingField}
            onRegeneratePostingPreparation={onRegeneratePostingPreparation}
            onUpdatePostingPreparation={onUpdatePostingPreparation}
            postingNotice={postingNotice}
            postingPreparation={postingPreparation}
          />
        </div>

        <aside className={styles.secondaryColumn}>
          <section className={styles.outputPanel} aria-labelledby="export-output-title">
            <div className={styles.outputHeader}>
              <div>
                <p className={styles.outputEyebrow}>Output</p>
                <h3 className={styles.outputTitle} id="export-output-title">
                  Delivery link
                </h3>
              </div>
              <button
                className={styles.secondaryButton}
                disabled={!outputUrl}
                onClick={onCopyOutputUrl}
                type="button"
              >
                Copy URL
              </button>
            </div>

            <div className={styles.outputCard}>
              <strong>{outputUrl ? 'Render ready' : 'Render pending'}</strong>
              <p className={styles.outputUrl}>
                {outputUrl ?? 'The final delivery URL will appear here once the render completes.'}
              </p>
              {outputUrl ? (
                <a
                  className={styles.outputLink}
                  href={outputUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open output
                </a>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
