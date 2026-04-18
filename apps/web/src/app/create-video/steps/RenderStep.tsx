import { useEffect, useMemo, useState } from 'react';
import type { VideoGenerationStep } from '@reevio/types';
import { type CustomSelectOption, CustomSelect } from '../components';
import { toPriceTierLabel } from '../page.helpers';
import type { ProviderDefinition, VideoResponse } from '../page.types';
import styles from '../page.module.css';

const QUEUE_PAGE_SIZE = 4;

const RENDER_PIPELINE_STEPS: readonly {
  readonly id: VideoGenerationStep;
  readonly label: string;
  readonly description: string;
}[] = [
  {
    id: 'parsePrompt',
    label: 'Parse prompt',
    description: 'Read the brief and identify the main short-form angle.',
  },
  {
    id: 'aiOrchestration',
    label: 'Orchestrate',
    description: 'Build script, scenes, voiceover, and pacing.',
  },
  {
    id: 'generateImages',
    label: 'Generate images',
    description: 'Create the visual assets for each scene.',
  },
  {
    id: 'buildScenes',
    label: 'Build scenes',
    description: 'Match the assets to the timeline and motion.',
  },
  {
    id: 'generateVideo',
    label: 'Generate video',
    description: 'Render the finished cut from the prepared scenes.',
  },
  {
    id: 'saveResult',
    label: 'Save result',
    description: 'Store the final file and publish the output URL.',
  },
] as const;

export interface RenderStepProps {
  readonly providers: readonly ProviderDefinition[];
  readonly selectedProvider: ProviderDefinition | null;
  readonly provider: string;
  readonly onProviderChange: (value: string) => void;
  readonly aspectRatio: string;
  readonly onAspectRatioChange: (value: string) => void;
  readonly hasEnoughCredits: boolean;
  readonly isLowCredit: boolean;
  readonly currentUserCredits: number | null;
  readonly isPending: boolean;
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly onRunQuickGenerate: () => void;
  readonly quickGenerateNotice: string | null;
  readonly videoStatus: string;
  readonly currentStep: VideoGenerationStep | null;
  readonly errorMessage: string | null;
  readonly queueVideos: readonly VideoResponse[];
  readonly activeVideoId: string | null;
  readonly onRefreshQueue: () => void;
  readonly onSelectQueueVideo: (videoId: string) => void;
}

export function RenderStep({
  providers,
  selectedProvider,
  provider,
  onProviderChange,
  aspectRatio,
  onAspectRatioChange,
  hasEnoughCredits,
  isLowCredit,
  currentUserCredits,
  isPending,
  onSubmit,
  onRunQuickGenerate,
  quickGenerateNotice,
  videoStatus,
  currentStep,
  errorMessage,
  queueVideos,
  activeVideoId,
  onRefreshQueue,
  onSelectQueueVideo,
}: RenderStepProps) {
  const providerOptions: readonly CustomSelectOption[] = providers.map(
    (providerDefinition) => ({
      value: providerDefinition.name,
      label: providerDefinition.label,
      meta: `${toPriceTierLabel(providerDefinition.priceTier)} · ${providerDefinition.creditCost} credits`,
    })
  );

  const aspectRatioOptions: readonly CustomSelectOption[] = [
    { value: '9:16', label: '9:16', meta: 'TikTok, Reels, Shorts' },
    { value: '16:9', label: '16:9', meta: 'Landscape video' },
    { value: '1:1', label: '1:1', meta: 'Square social post' },
    { value: '4:5', label: '4:5', meta: 'Portrait feed post' },
  ];

  const currentStepIndex = currentStep
    ? RENDER_PIPELINE_STEPS.findIndex((step) => step.id === currentStep)
    : videoStatus === 'queued'
      ? 0
      : -1;
  const activePipelineStep =
    currentStepIndex >= 0 ? RENDER_PIPELINE_STEPS[currentStepIndex] : null;
  const progressPercent =
    videoStatus === 'completed'
      ? 100
      : videoStatus === 'failed'
        ? currentStepIndex >= 0
          ? Math.round(((currentStepIndex + 1) / RENDER_PIPELINE_STEPS.length) * 100)
          : 0
        : currentStepIndex >= 0
          ? Math.max(
              8,
              Math.round(((currentStepIndex + 0.5) / RENDER_PIPELINE_STEPS.length) * 100)
            )
          : isPending
            ? 8
            : 0;
  const activeQueueCount = queueVideos.filter(
    (queuedVideo) => queuedVideo.status === 'queued' || queuedVideo.status === 'processing'
  ).length;
  const [queuePage, setQueuePage] = useState(1);
  const totalQueuePages = Math.max(1, Math.ceil(queueVideos.length / QUEUE_PAGE_SIZE));
  const paginatedQueueVideos = useMemo(() => {
    const startIndex = (queuePage - 1) * QUEUE_PAGE_SIZE;
    return queueVideos.slice(startIndex, startIndex + QUEUE_PAGE_SIZE);
  }, [queuePage, queueVideos]);
  const queueRangeStart = queueVideos.length === 0 ? 0 : (queuePage - 1) * QUEUE_PAGE_SIZE + 1;
  const queueRangeEnd = Math.min(queuePage * QUEUE_PAGE_SIZE, queueVideos.length);

  useEffect(() => {
    setQueuePage((currentPage) => Math.min(currentPage, totalQueuePages));
  }, [totalQueuePages]);

  return (
    <form onSubmit={onSubmit} className={styles.stack}>
      <section className={styles.toolPanel} aria-labelledby="render-setup-title">
        <div className={styles.toolHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Setup</p>
            <h3 className={styles.toolTitle} id="render-setup-title">
              Pick the render profile
            </h3>
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="provider">
              Render engine
            </label>
            <CustomSelect
              id="provider"
              options={providerOptions}
              value={provider}
              onValueChange={onProviderChange}
              disabled={providers.length <= 1}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="aspectRatio">
              Aspect ratio
            </label>
            <CustomSelect
              id="aspectRatio"
              options={aspectRatioOptions}
              value={aspectRatio}
              onValueChange={onAspectRatioChange}
            />
          </div>
        </div>

        {selectedProvider ? (
          <div className={styles.infoGrid}>
            <article className={styles.progressCard}>
              <span className={styles.metaBadge}>
                {toPriceTierLabel(selectedProvider.priceTier)}
              </span>
              <strong>{selectedProvider.label}</strong>
              <p className={styles.previewPrompt}>{selectedProvider.description}</p>
            </article>

            <article className={styles.progressCard}>
              <span className={styles.metaBadge}>Credits</span>
              <strong>
                {hasEnoughCredits ? 'Ready to render' : 'Need more credits'}
              </strong>
              <p className={styles.previewPrompt}>
                {currentUserCredits === null
                  ? 'Loading your remaining credits.'
                  : hasEnoughCredits
                    ? isLowCredit
                      ? `You have ${currentUserCredits} credits left, which is enough for this render but close to the next threshold.`
                      : `You have ${currentUserCredits} credits available for this ${selectedProvider.creditCost}-credit render.`
                    : `This render needs ${selectedProvider.creditCost} credits and you currently have ${currentUserCredits}.`}
              </p>
            </article>
          </div>
        ) : null}
      </section>

      <section className={styles.toolPanel} aria-labelledby="render-pipeline-title">
        <div className={styles.toolHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Render</p>
            <h3 className={styles.toolTitle} id="render-pipeline-title">
              Generate the short-form cut
            </h3>
          </div>
          <button
            className={styles.ghostButton}
            onClick={onRunQuickGenerate}
            type="button"
          >
            Quick generate
          </button>
        </div>

        <div className={styles.progressCard}>
          <strong>Pipeline status</strong>
          <p className={styles.previewPrompt}>
            Watch the render move from prompt parsing to the final output file.
          </p>
          <div className={styles.progressBarTrack} aria-hidden="true">
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Current status</span>
            <span className={styles.statusValue}>{videoStatus}</span>
          </div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Current step</span>
            <span className={styles.statusValue}>
              {videoStatus === 'completed'
                ? 'Render complete'
                : videoStatus === 'failed'
                  ? activePipelineStep?.label ?? 'Render failed'
                  : activePipelineStep?.label ?? (isPending ? 'Queued' : 'Waiting to start')}
            </span>
          </div>
          <p className={styles.progressMeta}>
            {videoStatus === 'completed'
              ? 'Your output is ready in the export step.'
              : videoStatus === 'failed'
                ? 'The pipeline stopped before finishing. Check the error below.'
                : activePipelineStep?.description ??
                  'Queue a render to see each pipeline stage update here.'}
          </p>
          <div className={styles.pipelineStepList}>
            {RENDER_PIPELINE_STEPS.map((step, index) => {
              const isDone =
                videoStatus === 'completed' ||
                (currentStepIndex >= 0 && index < currentStepIndex);
              const isCurrent =
                videoStatus !== 'completed' &&
                videoStatus !== 'failed' &&
                currentStepIndex === index;
              const isFailed =
                videoStatus === 'failed' && currentStepIndex === index;

              return (
                <div
                  className={[
                    styles.pipelineStep,
                    isDone ? styles.pipelineStepDone : '',
                    isCurrent ? styles.pipelineStepCurrent : '',
                    isFailed ? styles.pipelineStepFailed : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={step.id}
                >
                  <span className={styles.pipelineStepIndex}>{index + 1}</span>
                  <div className={styles.pipelineStepCopy}>
                    <strong>{step.label}</strong>
                    <span>{step.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {quickGenerateNotice ? <p className={styles.toolHint}>{quickGenerateNotice}</p> : null}
        {errorMessage ? (
          <article className={styles.errorPanel} role="alert" aria-live="assertive">
            <strong className={styles.errorTitle}>Render failed</strong>
            <p className={styles.errorMessage}>{errorMessage}</p>
          </article>
        ) : null}

        <div className={styles.formActions}>
          <button
            className={styles.submit}
            disabled={isPending || selectedProvider === null || !hasEnoughCredits}
            type="submit"
          >
            {isPending
              ? 'Generating video...'
              : !hasEnoughCredits && selectedProvider
                ? `Need ${selectedProvider.creditCost} credits`
            : 'Generate video'}
          </button>
        </div>
      </section>

      <section className={styles.toolPanel} aria-labelledby="render-queue-title">
        <div className={styles.toolHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Queue</p>
            <h3 className={styles.toolTitle} id="render-queue-title">
              Current render queue
            </h3>
          </div>
          <button
            className={styles.ghostButton}
            onClick={onRefreshQueue}
            type="button"
          >
            Refresh queue
          </button>
        </div>

        <div className={`${styles.infoGrid} ${styles.queueSummaryGrid}`}>
          <article className={styles.progressCard}>
            <span className={styles.metaBadge}>Active</span>
            <strong>{activeQueueCount} render{activeQueueCount === 1 ? '' : 's'}</strong>
            <p className={styles.previewPrompt}>
              Queued or processing items that still need worker time.
            </p>
          </article>
          <article className={styles.progressCard}>
            <span className={styles.metaBadge}>History</span>
            <strong>{queueVideos.length} total item{queueVideos.length === 1 ? '' : 's'}</strong>
            <p className={styles.previewPrompt}>
              Track a render to inspect its step, errors, or finished output.
            </p>
          </article>
        </div>

        {queueVideos.length > 0 ? (
          <div className={styles.queueSectionStack}>
            <div className={styles.queuePaginationHeader}>
              <span className={styles.queueMetaInline}>
                Showing {queueRangeStart}-{queueRangeEnd} of {queueVideos.length}
              </span>
              {totalQueuePages > 1 ? (
                <div className={styles.queuePaginationControls}>
                  <button
                    className={styles.ghostButton}
                    disabled={queuePage <= 1}
                    onClick={() => setQueuePage((currentPage) => Math.max(1, currentPage - 1))}
                    type="button"
                  >
                    Previous
                  </button>
                  <span className={styles.queuePageIndicator}>
                    Page {queuePage} / {totalQueuePages}
                  </span>
                  <button
                    className={styles.ghostButton}
                    disabled={queuePage >= totalQueuePages}
                    onClick={() =>
                      setQueuePage((currentPage) =>
                        Math.min(totalQueuePages, currentPage + 1)
                      )
                    }
                    type="button"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>

            <div className={styles.queueList}>
              {paginatedQueueVideos.map((queuedVideo) => {
              const isActiveVideo = queuedVideo.id === activeVideoId;
              const statusToneClass =
                queuedVideo.status === 'completed'
                  ? styles.queueStatusCompleted
                  : queuedVideo.status === 'failed'
                    ? styles.queueStatusFailed
                    : styles.queueStatusActive;

              return (
                <article
                  className={`${styles.queueCard} ${isActiveVideo ? styles.queueCardActive : ''}`}
                  key={queuedVideo.id}
                >
                  <div className={styles.queueCardTop}>
                    <div className={styles.queueMeta}>
                      <span className={`${styles.queueStatus} ${statusToneClass}`}>
                        {queuedVideo.status}
                      </span>
                      <span className={styles.queueTimestamp}>
                        {formatQueueTime(queuedVideo.updatedAt ?? queuedVideo.createdAt)}
                      </span>
                    </div>
                    <button
                      className={styles.secondaryButton}
                      onClick={() => onSelectQueueVideo(queuedVideo.id)}
                      type="button"
                    >
                      {isActiveVideo ? 'Tracking' : 'Track render'}
                    </button>
                  </div>

                  <div className={styles.queueCopy}>
                    <strong>{summarizePrompt(queuedVideo.prompt)}</strong>
                    <p className={styles.previewPrompt}>
                      {queuedVideo.currentStep
                        ? `Step: ${toStepLabel(queuedVideo.currentStep)}`
                        : queuedVideo.status === 'completed'
                          ? 'Render finished and ready to export.'
                          : queuedVideo.status === 'failed'
                            ? queuedVideo.errorMessage ?? 'Render failed before completion.'
                            : 'Waiting for the pipeline to start.'}
                    </p>
                  </div>

                  <div className={styles.queueFoot}>
                    <span className={styles.queueMetaInline}>
                      {queuedVideo.provider} · {queuedVideo.aspectRatio}
                    </span>
                    {queuedVideo.outputUrl ? (
                      <a
                        className={styles.outputLink}
                        href={queuedVideo.outputUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open output
                      </a>
                    ) : null}
                  </div>
                </article>
              );
              })}
            </div>
          </div>
        ) : (
          <div className={`${styles.progressCard} ${styles.queueEmptyState}`}>
            <strong>No renders yet</strong>
            <p className={styles.previewPrompt}>
              Your queued and completed videos will appear here as soon as you start the first render.
            </p>
          </div>
        )}
      </section>
    </form>
  );
}

function toStepLabel(step: VideoGenerationStep): string {
  return RENDER_PIPELINE_STEPS.find((pipelineStep) => pipelineStep.id === step)?.label ?? step;
}

function formatQueueTime(value?: string): string {
  if (!value) {
    return 'Just now';
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return 'Just now';
  }

  return timestamp.toLocaleString();
}

function summarizePrompt(prompt: string): string {
  const normalizedPrompt = prompt.replace(/\s+/g, ' ').trim();

  if (normalizedPrompt.length <= 88) {
    return normalizedPrompt;
  }

  return `${normalizedPrompt.slice(0, 85)}...`;
}
