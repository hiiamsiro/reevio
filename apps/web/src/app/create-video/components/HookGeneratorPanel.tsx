import type { HookGeneratorPanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function HookGeneratorPanel({
  hookSource,
  onHookSourceChange,
  onGenerateHooks,
  selectedHook,
  hookOptions,
  selectedHookId,
  copiedHookId,
  onCopyHook,
  onSelectHook,
  errorMessage,
}: HookGeneratorPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="hook-generator-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Phase 25</p>
          <h3 className={styles.toolTitle} id="hook-generator-title">
            Viral hook generator
          </h3>
        </div>
        <button className={styles.secondaryButton} onClick={onGenerateHooks} type="button">
          Regenerate
        </button>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="hookSource">
          Product description
        </label>
        <textarea
          id="hookSource"
          className={styles.textarea}
          value={hookSource}
          onChange={(event) => onHookSourceChange(event.target.value)}
        />
      </div>

      <div className={styles.toolActions}>
        <button className={styles.secondaryButton} onClick={onGenerateHooks} type="button">
          Generate 10 hooks
        </button>
        <span className={styles.toolHint}>Hooks stay short, emotional, and curiosity-driven.</span>
      </div>

      {selectedHook ? (
        <div className={styles.selectedHookCard}>
          <span className={styles.selectedHookLabel}>Selected hook</span>
          <strong>{selectedHook.text}</strong>
        </div>
      ) : null}

      <div className={styles.hookGrid}>
        {hookOptions.map((hookOption) => {
          const isSelected = hookOption.id === selectedHookId;
          const isCopied = hookOption.id === copiedHookId;

          return (
            <article
              className={`${styles.hookCard} ${isSelected ? styles.hookCardSelected : ''}`}
              key={hookOption.id}
            >
              <div className={styles.hookCardTop}>
                <span className={styles.metaBadge}>{hookOption.angle}</span>
                <span className={styles.metaBadge}>{isSelected ? 'Selected' : 'Ready'}</span>
              </div>
              <p className={styles.hookText}>{hookOption.text}</p>
              <div className={styles.hookActions}>
                <button
                  className={styles.ghostButton}
                  onClick={() => onCopyHook(hookOption)}
                  type="button"
                >
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
                <button
                  className={styles.ghostButton}
                  onClick={() => onSelectHook(hookOption.id)}
                  type="button"
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
    </section>
  );
}
