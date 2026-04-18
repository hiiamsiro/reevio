'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Jost, Playfair_Display } from 'next/font/google';
import { useEffect, useState } from 'react';
import {
  loadCurrentUser,
  loadProviders,
} from './page.api';
import { styleModes } from './page.constants';
import { toInlineMediaUrl } from './page.helpers';
import { BriefStep } from './steps/BriefStep';
import { RenderStep } from './steps/RenderStep';
import { PublishStep } from './steps/PublishStep';
import {
  CreateVideoProvider,
  useCreateVideo,
} from './hooks/useCreateVideoContext';
import type { CurrentUser, ProviderDefinition } from './page.types';
import styles from './page.module.css';

const studioDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--landing-font-display',
});
const studioBody = Jost({
  subsets: ['latin'],
  variable: '--landing-font-body',
});

function CreateVideoInner() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [previewPlaybackFailed, setPreviewPlaybackFailed] = useState(false);
  const {
    activeStudioStep,
    setActiveStudioStep,
    studioSteps,
    activeStepIndex,
    previousStep,
    nextStep,
    stepCompletion,
    prompt,
    onPromptChange,
    rewriteVariations,
    selectedRewriteIndex,
    onSelectedRewriteIndexChange,
    onApplyRewriteVariation,
    trendIdeas,
    videoTemplates,
    onApplyTemplate,
    providers,
    selectedProvider,
    provider,
    onProviderChange,
    aspectRatio,
    onAspectRatioChange,
    hasEnoughCredits,
    isLowCredit,
    currentUser,
    video,
    queueVideos,
    isPending,
    quickGenerateNotice,
    errorMessage,
    onSubmit,
    onRunQuickGenerate,
    onRefreshQueue,
    onSelectQueueVideo,
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
  } = useCreateVideo();

  const activeStepMeta = studioSteps[activeStepIndex] ?? studioSteps[0];
  const activeStatus = video?.status ?? (isPending ? 'queued' : 'ready');
  const previewSourceUrl = outputUrl;
  const previewMediaUrl = toInlineMediaUrl(previewSourceUrl);

  useEffect(() => {
    setPreviewPlaybackFailed(false);
  }, [previewMediaUrl]);

  const handleLogout = async (): Promise<void> => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to log out.');
      }

      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error(error);
      setIsLoggingOut(false);
    }
  };

  const renderActiveStep = () => {
    switch (activeStudioStep) {
      case 'brief':
        return (
          <BriefStep
            prompt={prompt}
            onPromptChange={onPromptChange}
            rewriteVariations={rewriteVariations}
            selectedRewriteIndex={selectedRewriteIndex}
            onSelectedRewriteIndexChange={onSelectedRewriteIndexChange}
            onApplyRewriteVariation={onApplyRewriteVariation}
            trendIdeas={trendIdeas}
            videoTemplates={videoTemplates}
            onApplyTemplate={onApplyTemplate}
          />
        );
      case 'render':
        return (
          <RenderStep
            providers={providers}
            selectedProvider={selectedProvider}
            provider={provider}
            onProviderChange={onProviderChange}
            aspectRatio={aspectRatio}
            onAspectRatioChange={onAspectRatioChange}
            hasEnoughCredits={hasEnoughCredits}
            isLowCredit={isLowCredit}
            currentUserCredits={currentUser?.credits ?? null}
            isPending={isPending}
            onSubmit={onSubmit}
            onRunQuickGenerate={onRunQuickGenerate}
            quickGenerateNotice={quickGenerateNotice}
            videoStatus={activeStatus}
            currentStep={video?.currentStep ?? null}
            errorMessage={errorMessage}
            queueVideos={queueVideos}
            activeVideoId={video?.id ?? null}
            onRefreshQueue={onRefreshQueue}
            onSelectQueueVideo={onSelectQueueVideo}
          />
        );
      case 'export':
        return (
          <PublishStep
            prompt={prompt}
            exportFormats={exportFormats}
            selectedExportFormatId={selectedExportFormatId}
            onSelectExportFormat={onSelectExportFormat}
            onDownloadFormat={onDownloadFormat}
            onDownloadAllFormats={onDownloadAllFormats}
            postingPreparation={postingPreparation}
            onRegeneratePostingPreparation={onRegeneratePostingPreparation}
            onCopyPostingField={onCopyPostingField}
            onUpdatePostingPreparation={onUpdatePostingPreparation}
            postingNotice={postingNotice}
            outputUrl={outputUrl}
            onCopyOutputUrl={onCopyOutputUrl}
          />
        );
    }
  };

  const nextStepLabel =
    nextStep !== null
      ? studioSteps.find((step) => step.id === nextStep)?.label ?? nextStep
      : null;

  const canAdvance =
    activeStudioStep === 'brief'
      ? stepCompletion.brief
      : activeStudioStep === 'render'
        ? stepCompletion.export
        : false;

  return (
    <main
      className={`${styles.page} ${studioDisplay.variable} ${studioBody.variable}`}
    >
      <div className={styles.backdrop} />
      <div className={styles.gridLines} />
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />
      <div className={styles.shell}>
        <header className={styles.nav}>
          <div className={styles.brandLockup}>
            <span className={styles.brandMark} aria-hidden="true" />
            <div>
              <p className={styles.brandName}>Reevio Studio</p>
              <p className={styles.brandMeta}>Luxury AI short-form atelier</p>
            </div>
          </div>

          <div className={styles.navActions}>
            <Link className={styles.navLink} href="/">
              Home
            </Link>
            <Link className={styles.navLink} href="/pricing">
              Pricing
            </Link>
            <button
              className={styles.navButton}
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              type="button"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Luxury short-form studio</p>
            <h1 className={styles.title}>
              Craft premium TikTok, Reels, and Shorts cuts from one editorial brief.
            </h1>
            <p className={styles.subtitle}>
              Reevio keeps the production loop refined: shape the brief, direct
              the render, monitor the live cut, and package a polished final
              output without losing the luxury tone.
            </p>
            <div className={styles.quickRow}>
              {styleModes.map((mode) => (
                <span className={styles.quickPill} key={mode}>
                  {mode}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.heroMetric}>
              <span>Render house</span>
              <strong>{selectedProvider?.label ?? 'No renderer configured'}</strong>
            </div>
            <div className={styles.heroMetric}>
              <span>Canvas</span>
              <strong>{aspectRatio}</strong>
            </div>
            <div className={styles.heroMetric}>
              <span>Credit reserve</span>
              <strong>{currentUser?.credits ?? '--'}</strong>
            </div>
            <div className={styles.heroMetric}>
              <span>Studio status</span>
              <strong>{activeStatus}</strong>
            </div>
          </div>
        </section>

        <div className={styles.workspaceGrid}>
          <section className={styles.mainCard}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.sectionEyebrow}>{activeStepMeta.eyebrow}</p>
                <h2 className={styles.cardTitle}>{activeStepMeta.label}</h2>
                <p className={styles.sectionSummary}>{activeStepMeta.description}</p>
              </div>
              <div className={styles.metaCluster}>
                <span className={styles.metaBadge}>
                  {currentUser ? `${currentUser.credits} credits` : 'Loading credits'}
                </span>
                <span className={styles.metaBadge}>{aspectRatio}</span>
                <span className={styles.metaBadge}>{activeStatus}</span>
              </div>
            </div>

            <div className={styles.stepTabs} aria-label="Studio workflow steps">
              {studioSteps.map((step) => {
                const isActive = step.id === activeStudioStep;

                return (
                  <button
                    aria-pressed={isActive}
                    className={`${styles.stepButton} ${isActive ? styles.stepButtonActive : ''}`}
                    key={step.id}
                    onClick={() => setActiveStudioStep(step.id)}
                    type="button"
                  >
                    <span className={styles.stepButtonEyebrow}>{step.eyebrow}</span>
                    <strong className={styles.stepButtonLabel}>{step.label}</strong>
                    <span className={styles.stepButtonMeta}>{step.description}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.activePanel}>{renderActiveStep()}</div>

            <div className={styles.stepActions}>
              <button
                className={styles.ghostButton}
                disabled={previousStep === null}
                onClick={() => previousStep && setActiveStudioStep(previousStep)}
                type="button"
              >
                Previous step
              </button>

              {nextStepLabel ? (
                <button
                  className={styles.secondaryButton}
                  disabled={!canAdvance}
                  onClick={() => nextStep && setActiveStudioStep(nextStep)}
                  type="button"
                >
                  Continue to {nextStepLabel}
                </button>
              ) : null}
            </div>
          </section>

          <aside className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Live preview</p>
                <h2 className={styles.previewTitle}>Editorial preview, always visible</h2>
              </div>
              <div className={styles.previewTop}>
                <span className={styles.pill}>
                  {selectedProvider?.label ?? provider ?? 'Renderer'}
                </span>
                <span className={styles.pill}>{aspectRatio}</span>
                <span className={styles.pill}>{activeStatus}</span>
              </div>
            </div>

            <div className={styles.previewScreen}>
              {previewMediaUrl && !previewPlaybackFailed ? (
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
              ) : previewMediaUrl ? (
                <div className={styles.previewPlaceholder}>
                  <span className={styles.previewLabel}>Output ready</span>
                  <h3 className={styles.previewHeadline}>Inline playback is unavailable</h3>
                  <p className={styles.previewPrompt}>
                    The render finished, but this browser could not play it inline.
                  </p>
                  <a
                    className={styles.secondaryButtonLink}
                    href={previewSourceUrl ?? '#'}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open output
                  </a>
                </div>
              ) : (
                <div className={styles.previewPlaceholder}>
                  <span className={styles.previewLabel}>Current brief</span>
                  <h3 className={styles.previewHeadline}>Luxury render preview</h3>
                  <p className={styles.previewPrompt}>
                    Start a render to keep the latest cut visible here while you
                    refine export formats, posting copy, and the final presentation.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.statusList}>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Brief</span>
                <span className={styles.statusValue}>
                  {prompt.trim() || 'No brief added yet'}
                </span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Video ID</span>
                <span className={styles.statusValue}>
                  {video?.id ?? 'Waiting for first request'}
                </span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Voiceover</span>
                <span className={styles.statusValue}>
                  {video?.voiceoverUrl ?? 'Available after orchestration'}
                </span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Subtitles</span>
                <span className={styles.statusValue}>
                  {video?.subtitlesUrl ?? 'Available after orchestration'}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CreateVideoPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [providers, setProviders] = useState<readonly ProviderDefinition[]>([]);

  useEffect(() => {
    let isActive = true;
    void loadCurrentUser(router)
      .then((session) => {
        if (!isActive || !session) return;
        setCurrentUser(session);
      })
      .catch(() => undefined);

    void loadProviders(router)
      .then((providerList) => {
        if (!isActive || !providerList) return;
        setProviders(providerList);
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [router]);

  return (
    <CreateVideoProvider
      router={router}
      initialCurrentUser={currentUser}
      initialProviders={providers}
    >
      <CreateVideoInner />
    </CreateVideoProvider>
  );
}
