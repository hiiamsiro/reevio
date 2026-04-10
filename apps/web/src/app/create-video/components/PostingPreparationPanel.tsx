import type { PostingPreparationPanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function PostingPreparationPanel({
  postingPreparation,
  onRegeneratePostingPreparation,
  onCopyPostingField,
  onUpdatePostingPreparation,
  postingNotice,
}: PostingPreparationPanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="posting-prep-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Phase 29</p>
          <h3 className={styles.toolTitle} id="posting-prep-title">
            Posting preparation
          </h3>
        </div>
        <button className={styles.secondaryButton} onClick={onRegeneratePostingPreparation} type="button">
          Refresh content
        </button>
      </div>

      <div className={styles.progressCard}>
        <div className={styles.copyBar}>
          <label className={styles.label} htmlFor="postingTitle">
            Title
          </label>
          <button
            className={styles.ghostButton}
            onClick={() => onCopyPostingField('Title', postingPreparation.title)}
            type="button"
          >
            Copy
          </button>
        </div>
        <input
          id="postingTitle"
          className={styles.textInput}
          value={postingPreparation.title}
          onChange={(event) => onUpdatePostingPreparation('title', event.target.value)}
        />
      </div>

      <div className={styles.progressCard}>
        <div className={styles.copyBar}>
          <label className={styles.label} htmlFor="postingCaption">
            Caption
          </label>
          <button
            className={styles.ghostButton}
            onClick={() => onCopyPostingField('Caption', postingPreparation.caption)}
            type="button"
          >
            Copy
          </button>
        </div>
        <textarea
          id="postingCaption"
          className={styles.textarea}
          value={postingPreparation.caption}
          onChange={(event) => onUpdatePostingPreparation('caption', event.target.value)}
        />
      </div>

      <div className={styles.progressCard}>
        <div className={styles.copyBar}>
          <label className={styles.label} htmlFor="postingHashtags">
            Hashtags
          </label>
          <button
            className={styles.ghostButton}
            onClick={() => onCopyPostingField('Hashtags', postingPreparation.hashtags)}
            type="button"
          >
            Copy
          </button>
        </div>
        <textarea
          id="postingHashtags"
          className={styles.textarea}
          value={postingPreparation.hashtags}
          onChange={(event) => onUpdatePostingPreparation('hashtags', event.target.value)}
        />
      </div>

      {postingNotice ? <p className={styles.toolHint}>{postingNotice}</p> : null}
    </section>
  );
}
