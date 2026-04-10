import type { TemplateGalleryPanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function TemplateGalleryPanel({ videoTemplates, onApplyTemplate }: TemplateGalleryPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="template-system-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Phase 34</p>
          <h3 className={styles.toolTitle} id="template-system-title">
            Template gallery
          </h3>
        </div>
      </div>

      <div className={styles.progressList}>
        {videoTemplates.map((template) => (
          <article className={styles.progressCard} key={template.id}>
            <strong>{template.name}</strong>
            <p className={styles.previewPrompt}>{template.preview}</p>
            <button
              className={styles.secondaryButton}
              onClick={() => onApplyTemplate(template.prompt)}
              type="button"
            >
              Preview template
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
