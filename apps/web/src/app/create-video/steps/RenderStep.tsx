import { useEffect, useState } from 'react';
import type { ProviderDefinition } from '../page.types';
import styles from './RenderStep.module.css';

export interface RenderStepProps {
  readonly provider: string;
  readonly selectedProvider: ProviderDefinition | null;
  readonly hasEnoughCredits: boolean;
  readonly isPending: boolean;
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly onRunAutoContentMachine: () => void;
  readonly autoMachineNotice: string | null;
  readonly videoStatus: string;
  readonly previewMediaUrl: string | null;
  readonly videoTitle: string | null;
  readonly prompt: string;
  readonly errorMessage: string | null;
}

export function RenderStep({
  provider,
  selectedProvider,
  hasEnoughCredits,
  isPending,
  onSubmit,
  onRunAutoContentMachine,
  autoMachineNotice,
  videoStatus,
  previewMediaUrl,
  videoTitle,
  prompt,
  errorMessage,
}: RenderStepProps) {
  const [previewPlaybackFailed, setPreviewPlaybackFailed] = useState(false);

  useEffect(() => {
    setPreviewPlaybackFailed(false);
  }, [previewMediaUrl]);

  return (
    <form onSubmit={onSubmit}>
      <section className={styles.toolPanel} aria-labelledby="auto-machine-title">
        <div className={styles.toolHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Render</p>
            <h3 className={styles.toolTitle} id="auto-machine-title">
              Auto content machine
            </h3>
          </div>
          <button
            className={styles.secondaryButton}
            onClick={onRunAutoContentMachine}
            type="button"
          >
            1-click video
          </button>
        </div>

        <div className={styles.progressCard}>
          <strong>Pipeline</strong>
          <p className={styles.previewPrompt}>
            Auto script, auto video, auto voiceover, ready output.
          </p>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Current status</span>
            <span className={styles.statusValue}>{videoStatus}</span>
          </div>
        </div>

        {autoMachineNotice ? <p className={styles.toolHint}>{autoMachineNotice}</p> : null}
        {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}

        {previewMediaUrl && !previewPlaybackFailed ? (
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewEyebrow}>Latest output</span>
              <strong>{videoTitle ?? 'Render preview'}</strong>
            </div>
            <video
              autoPlay
              className={styles.previewVideo}
              controls
              loop
              muted
              onError={() => setPreviewPlaybackFailed(true)}
              playsInline
              preload="metadata"
              src={previewMediaUrl}
            />
            <p className={styles.previewPrompt}>{prompt}</p>
          </div>
        ) : previewMediaUrl ? (
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewEyebrow}>Latest output</span>
              <strong>{videoTitle ?? 'Render complete'}</strong>
            </div>
            <p className={styles.previewPrompt}>
              Video da render xong nhung khong play inline duoc. Mo file output truc tiep ben duoi.
            </p>
            <a
              className={styles.secondaryButtonLink}
              href={previewMediaUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open output
            </a>
          </div>
        ) : null}
      </section>

      <button
        className={styles.submit}
        disabled={isPending || selectedProvider === null || !hasEnoughCredits}
        type="submit"
      >
        {isPending
          ? 'Generating preview...'
          : !hasEnoughCredits && selectedProvider
            ? `Need ${selectedProvider.creditCost} credits`
            : 'Generate video'}
      </button>
    </form>
  );
}
