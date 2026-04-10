import type { HashtagGeneratorPanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function HashtagGeneratorPanel({
  hashtagSuggestions,
  onRegenerateHashtags,
  onCopyHashtags,
  onUseHashtagsInPosting,
  hashtagNotice,
}: HashtagGeneratorPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="hashtag-generator-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Phase 30</p>
          <h3 className={styles.toolTitle} id="hashtag-generator-title">
            Hashtag generator
          </h3>
        </div>
        <div className={styles.progressActions}>
          <button className={styles.secondaryButton} onClick={onRegenerateHashtags} type="button">
            Regenerate
          </button>
          <button className={styles.ghostButton} onClick={onCopyHashtags} type="button">
            Copy
          </button>
        </div>
      </div>

      <div className={styles.progressCard}>
        <span className={styles.selectedHookLabel}>Trending mix</span>
        <div className={styles.tagList}>
          {hashtagSuggestions.trending.map((hashtag) => (
            <span className={styles.metaBadge} key={hashtag}>
              {hashtag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.progressCard}>
        <span className={styles.selectedHookLabel}>Niche mix</span>
        <div className={styles.tagList}>
          {hashtagSuggestions.niche.map((hashtag) => (
            <span className={styles.metaBadge} key={hashtag}>
              {hashtag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.progressCard}>
        <span className={styles.selectedHookLabel}>Copy-ready set</span>
        <p className={styles.previewPrompt}>{hashtagSuggestions.combined}</p>
        <button className={styles.secondaryButton} onClick={onUseHashtagsInPosting} type="button">
          Use in posting prep
        </button>
      </div>

      {hashtagNotice ? <p className={styles.toolHint}>{hashtagNotice}</p> : null}
    </section>
  );
}
