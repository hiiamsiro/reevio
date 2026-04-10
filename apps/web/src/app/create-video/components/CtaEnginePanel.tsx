import { CTA_TYPES } from '../page.constants';
import { toCtaTypeLabel } from '../content-studio';
import type { CtaEnginePanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function CtaEnginePanel({
  ctaType,
  onSelectCtaType,
  onRegenerateCta,
  ctaText,
  onCtaTextChange,
}: CtaEnginePanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="cta-engine-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Phase 26</p>
          <h3 className={styles.toolTitle} id="cta-engine-title">
            CTA engine
          </h3>
        </div>
        <button className={styles.secondaryButton} onClick={onRegenerateCta} type="button">
          Regenerate CTA
        </button>
      </div>

      <div className={styles.segmentGroup} aria-label="CTA type">
        {CTA_TYPES.map((type) => {
          const isActive = type === ctaType;

          return (
            <button
              aria-pressed={isActive}
              className={`${styles.segmentButton} ${isActive ? styles.segmentButtonActive : ''}`}
              key={type}
              onClick={() => onSelectCtaType(type)}
              type="button"
            >
              {toCtaTypeLabel(type)}
            </button>
          );
        })}
      </div>

      <div className={styles.selectedHookCard}>
        <span className={styles.selectedHookLabel}>Placement</span>
        <strong>End of video</strong>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="ctaText">
          CTA copy
        </label>
        <textarea
          id="ctaText"
          className={styles.textarea}
          value={ctaText}
          onChange={(event) => onCtaTextChange(event.target.value)}
        />
      </div>
    </section>
  );
}
