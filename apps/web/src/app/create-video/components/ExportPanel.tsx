import { getExportFrameClassName } from '../page.helpers';
import type { ExportPanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function ExportPanel({
  exportFormats,
  selectedExportFormat,
  onSelectExportFormat,
  onDownloadAllFormats,
  onDownloadFormat,
}: ExportPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="export-engine-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Phase 27</p>
          <h3 className={styles.toolTitle} id="export-engine-title">
            Multi-format export
          </h3>
        </div>
        <button className={styles.secondaryButton} onClick={onDownloadAllFormats} type="button">
          Download all
        </button>
      </div>

      <div className={styles.exportList}>
        {exportFormats.map((format) => {
          const isActive = format.id === selectedExportFormat.id;

          return (
            <button
              aria-pressed={isActive}
              className={`${styles.exportOption} ${isActive ? styles.exportOptionActive : ''}`}
              key={format.id}
              onClick={() => onSelectExportFormat(format.id)}
              type="button"
            >
              <span className={styles.exportPlatform}>{format.label}</span>
              <span className={styles.exportMeta}>{format.canvas}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.exportPreviewShell}>
        <div
          className={`${styles.exportPreviewFrame} ${getExportFrameClassName(selectedExportFormat.id, styles)}`}
        >
          <div className={styles.exportPreviewOverlay}>
            <span className={styles.selectedHookLabel}>{selectedExportFormat.platform}</span>
            <strong>{selectedExportFormat.previewHeadline}</strong>
            <p className={styles.previewPrompt}>{selectedExportFormat.previewBody}</p>
            <span className={styles.metaBadge}>{selectedExportFormat.ctaLabel}</span>
          </div>
        </div>

        <div className={styles.selectedHookCard}>
          <span className={styles.selectedHookLabel}>Layout behavior</span>
          <strong>{selectedExportFormat.layoutLabel}</strong>
        </div>

        <button className={styles.secondaryButton} onClick={() => onDownloadFormat(selectedExportFormat)} type="button">
          Download {selectedExportFormat.label}
        </button>
      </div>
    </section>
  );
}
