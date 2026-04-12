'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Jost, Playfair_Display } from 'next/font/google';
import { useEffect, useState } from 'react';
import {
  loadCurrentUser,
  loadProviders,
} from './page.api';
import { styleModes } from './page.constants';
import { toPriceTierLabel } from './page.helpers';
import { BriefStep } from './steps/BriefStep';
import { SetupStep } from './steps/SetupStep';
import { RenderStep } from './steps/RenderStep';
import { PublishStep } from './steps/PublishStep';
import {
  CreateVideoProvider,
  useCreateVideo,
} from './hooks/useCreateVideoContext';
import type {
  CurrentUser,
  ProviderDefinition,
} from './page.types';
import styles from './page.module.css';

// ─── Fonts ───────────────────────────────────────────────────────────────────

const studioDisplay = Playfair_Display({ subsets: ['latin'], variable: '--landing-font-display' });
const studioBody = Jost({ subsets: ['latin'], variable: '--landing-font-body' });

// ─── Inner page (has access to context) ─────────────────────────────────────

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
    // Brief
    hookSource,
    onHookSourceChange,
    onGenerateHooks,
    onUseCurrentBrief,
    selectedHook,
    hookOptions,
    selectedHookId,
    copiedHookId,
    onCopyHook,
    onSelectHook,
    hookErrorMessage,
    ctaType,
    ctaSeed,
    ctaText,
    onCtaTextChange,
    onRegenerateCta,
    onSelectCtaType,
    prompt,
    onPromptChange,
    rewriteVariations,
    selectedRewriteIndex,
    onSelectedRewriteIndexChange,
    onApplyRewriteVariation,
    onApplyTemplate,
    trendIdeas,
    videoTemplates,
    // Setup
    providers,
    selectedProvider,
    provider,
    onProviderChange,
    aspectRatio,
    onAspectRatioChange,
    hasEnoughCredits,
    isLowCredit,
    currentUser,
    bulkInput,
    onBulkInputChange,
    onBulkFileUpload,
    bulkJobs,
    onGenerateBulk,
    isBulkGenerating,
    onRetryBulkJob,
    onRetryFailedBulkJobs,
    bulkErrorMessage,
    viralScoreAnalysis,
    // Render
    video,
    isPending,
    autoMachineNotice,
    onSubmit,
    onRunAutoContentMachine,
    // Publish
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
    hashtagSuggestions,
    onRegenerateHashtags,
    onCopyHashtags,
    onUseHashtagsInPosting,
    hashtagNotice,
    inviteEmail,
    onInviteEmailChange,
    inviteRole,
    onInviteRoleChange,
    onInviteMember,
    teamMembers,
    teamNotice,
    watermarkType,
    onWatermarkTypeChange,
    watermarkText,
    onWatermarkTextChange,
    watermarkPosition,
    onWatermarkPositionChange,
    referralCode,
    referralCredits,
    onCopyReferralCode,
    onCopyStorageUrl,
    views,
    onViewsChange,
    likes,
    onLikesChange,
    watchTime,
    onWatchTimeChange,
    performanceInsight,
    storageUrl,
    selectedHook: hookSelected,
  } = useCreateVideo();

  const activeStepMeta = studioSteps[activeStepIndex] ?? studioSteps[0];
  const activeStatus = video?.status ?? (isPending ? 'queued' : 'ready');
  const previewMediaUrl = video?.outputUrl ?? video?.previewUrl ?? null;

  useEffect(() => {
    setPreviewPlaybackFailed(false);
  }, [previewMediaUrl]);

  const nextWorkspaceAction =
    activeStudioStep === 'brief'
      ? 'Lock the prompt, choose a hook, and define the CTA before moving on.'
      : activeStudioStep === 'setup'
        ? 'Select provider, aspect ratio, and make sure credits are ready.'
        : activeStudioStep === 'render'
          ? 'Generate the video and wait for the preview state to complete.'
          : 'Export the output, prep posting assets, and hand it off.';

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
            hookSource={hookSource}
            onHookSourceChange={onHookSourceChange}
            onGenerateHooks={onGenerateHooks}
            onUseCurrentBrief={onUseCurrentBrief}
            selectedHook={hookSelected}
            hookOptions={hookOptions}
            selectedHookId={selectedHookId}
            copiedHookId={copiedHookId}
            onCopyHook={onCopyHook}
            onSelectHook={onSelectHook}
            hookErrorMessage={hookErrorMessage}
            ctaType={ctaType}
            ctaSeed={ctaSeed}
            ctaText={ctaText}
            onCtaTextChange={onCtaTextChange}
            onRegenerateCta={onRegenerateCta}
            onSelectCtaType={onSelectCtaType}
            prompt={prompt}
            onPromptChange={onPromptChange}
            rewriteVariations={rewriteVariations}
            selectedRewriteIndex={selectedRewriteIndex}
            onSelectedRewriteIndexChange={onSelectedRewriteIndexChange}
            onApplyRewriteVariation={onApplyRewriteVariation}
            onApplyTemplate={onApplyTemplate}
            trendIdeas={trendIdeas}
            videoTemplates={videoTemplates}
          />
        );

      case 'setup':
        return (
          <SetupStep
            providers={providers}
            selectedProvider={selectedProvider}
            provider={provider}
            onProviderChange={onProviderChange}
            aspectRatio={aspectRatio}
            onAspectRatioChange={onAspectRatioChange}
            hasEnoughCredits={hasEnoughCredits}
            isLowCredit={isLowCredit}
            currentUserCredits={currentUser?.credits ?? null}
            bulkInput={bulkInput}
            onBulkInputChange={onBulkInputChange}
            onBulkFileUpload={onBulkFileUpload}
            onGenerateBulk={onGenerateBulk}
            isBulkGenerating={isBulkGenerating}
            onRetryFailedBulkJobs={onRetryFailedBulkJobs}
            bulkJobs={bulkJobs}
            onRetryBulkJob={onRetryBulkJob}
            bulkErrorMessage={bulkErrorMessage}
            viralScoreAnalysis={viralScoreAnalysis}
          />
        );

      case 'render':
        return (
          <RenderStep
            provider={provider}
            selectedProvider={selectedProvider}
            hasEnoughCredits={hasEnoughCredits}
            isPending={isPending}
            onSubmit={onSubmit}
            onRunAutoContentMachine={onRunAutoContentMachine}
            autoMachineNotice={autoMachineNotice}
            videoStatus={activeStatus}
            previewMediaUrl={previewMediaUrl}
            videoTitle={video?.title ?? null}
            prompt={prompt}
            errorMessage={video?.errorMessage ?? null}
          />
        );

      case 'publish':
        return (
          <PublishStep
            prompt={prompt}
            selectedHookText={hookSelected?.text ?? null}
            ctaText={ctaText}
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
            hashtagSuggestions={hashtagSuggestions}
            onRegenerateHashtags={onRegenerateHashtags}
            onCopyHashtags={onCopyHashtags}
            onUseHashtagsInPosting={onUseHashtagsInPosting}
            hashtagNotice={hashtagNotice}
            inviteEmail={inviteEmail}
            onInviteEmailChange={onInviteEmailChange}
            inviteRole={inviteRole}
            onInviteRoleChange={onInviteRoleChange}
            onInviteMember={onInviteMember}
            teamMembers={teamMembers}
            teamNotice={teamNotice}
            watermarkType={watermarkType}
            onWatermarkTypeChange={onWatermarkTypeChange}
            watermarkText={watermarkText}
            onWatermarkTextChange={onWatermarkTextChange}
            watermarkPosition={watermarkPosition}
            onWatermarkPositionChange={onWatermarkPositionChange}
            storageUrl={storageUrl}
            onCopyStorageUrl={onCopyStorageUrl}
            bulkJobs={bulkJobs}
            referralCode={referralCode}
            onCopyReferralCode={onCopyReferralCode}
            referralCredits={referralCredits}
            views={views}
            onViewsChange={onViewsChange}
            likes={likes}
            onLikesChange={onLikesChange}
            watchTime={watchTime}
            onWatchTimeChange={onWatchTimeChange}
            performanceInsight={performanceInsight}
          />
        );
    }
  };

  return (
    <main className={`${styles.page} ${studioDisplay.variable} ${studioBody.variable}`}>
      <div className={styles.backdrop} />
      <div className={styles.gridLines} />
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.shell}>
        {/* ── Nav ─────────────────────────────────────────────────── */}
        <header className={styles.nav}>
          <div className={styles.brandLockup}>
            <span className={styles.brandMark} aria-hidden="true" />
            <div>
              <p className={styles.brandName}>Reevio Studio</p>
              <p className={styles.brandMeta}>Create video workspace</p>
            </div>
          </div>
          <div className={styles.navActions}>
            <span className={styles.liveBadge}>
              {currentUser ? `${currentUser.email} · ${currentUser.plan}` : 'Loading workspace'}
            </span>
            <Link className={styles.navLink} href="/pricing">
              Buy credits
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

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Create video</p>
            <h1 className={styles.title}>
              Generate, preview, and route renders inside the same visual system.
            </h1>
            <p className={styles.subtitle}>
              This editor now follows the same dark glass surface as the landing page, with vibrant
              accents for prompts, provider state, and render feedback.
            </p>
            <div className={styles.quickRow}>
              {styleModes.map((mode) => (
                <span className={styles.quickPill} key={mode}>{mode}</span>
              ))}
            </div>
          </div>
          <div className={styles.heroPanel}>
            <div className={styles.heroMetric}>
              <span>Active provider</span>
              <strong>{selectedProvider?.label ?? 'Loading providers'}</strong>
            </div>
            <div className={styles.heroMetric}>
              <span>Remaining credits</span>
              <strong>{currentUser ? currentUser.credits : '--'}</strong>
            </div>
            <div className={styles.heroMetric}>
              <span>Credit cost</span>
              <strong>{selectedProvider ? `${selectedProvider.creditCost} credits` : '--'}</strong>
            </div>
            <div className={styles.heroMetric}>
              <span>Render status</span>
              <strong>{activeStatus}</strong>
            </div>
          </div>
        </section>

        {/* ── Main grid ─────────────────────────────────────────────── */}
        <div className={styles.studioGrid}>
          {/* ── Step panel ─────────────────────────────────────────── */}
          <section className={`${styles.card} ${styles.panelStack}`}>
            {/* Step tabs */}
            <div className={styles.tabList} aria-label="Create video workflow steps">
              {studioSteps.map((step) => {
                const isActive = step.id === activeStudioStep;
                const isReady = stepCompletion[step.id];
                return (
                  <button
                    aria-pressed={isActive}
                    className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''} ${isActive ? styles.tabButtonCurrent : ''}`}
                    data-current={isActive ? 'true' : 'false'}
                    key={step.id}
                    onClick={() => setActiveStudioStep(step.id)}
                    type="button"
                  >
                    <span className={styles.tabEyebrow}>{step.eyebrow}</span>
                    <strong>{step.label}</strong>
                    <span className={styles.tabDescription}>{step.description}</span>
                    <span
                      className={`${styles.tabStatus} ${isActive ? styles.tabStatusCurrent : ''}`}
                    >
                      {isActive ? 'Current step' : isReady ? 'Ready' : step.status}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Card header */}
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.sectionEyebrow}>{activeStepMeta.eyebrow}</p>
                <h2 className={styles.cardTitle}>
                  {activeStudioStep === 'brief'
                    ? 'Write the brief and shape the creative angle.'
                    : activeStudioStep === 'setup'
                      ? 'Configure the render stack before spending credits.'
                      : activeStudioStep === 'render'
                        ? 'Launch the render and monitor the output.'
                        : 'Package the output for publishing and handoff.'}
                </h2>
                <p className={styles.sectionSummary}>{nextWorkspaceAction}</p>
              </div>
              <div className={styles.metaCluster}>
                <span className={styles.metaBadge}>
                  {currentUser ? `${currentUser.credits} credits` : 'Loading credits'}
                </span>
                {selectedProvider ? (
                  <span className={styles.metaBadge}>{selectedProvider.creditCost} credits / render</span>
                ) : null}
                <span className={styles.metaBadge}>{activeStepMeta.label} workspace</span>
              </div>
            </div>

            {/* Summary strip */}
            <div className={styles.summaryStrip}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Current step</span>
                <strong>{activeStepMeta.label}</strong>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Next milestone</span>
                <strong>{nextStep ? studioSteps.find(s => s.id === nextStep)?.label ?? nextStep : 'Finalize publish stack'}</strong>
              </div>
            </div>

            {/* Active step content */}
            <div className={styles.activePanel}>
              {renderActiveStep()}
            </div>

            {/* Step navigation */}
            <div className={styles.stepActions}>
              <button
                className={styles.ghostButton}
                disabled={previousStep === null}
                onClick={() => previousStep && setActiveStudioStep(previousStep)}
                type="button"
              >
                Previous step
              </button>
              {nextStep ? (
                <button
                  className={styles.secondaryButton}
                  disabled={!stepCompletion[activeStudioStep]}
                  onClick={() => setActiveStudioStep(nextStep)}
                  type="button"
                >
                  Continue to {nextStep ? nextStep.charAt(0).toUpperCase() + nextStep.slice(1) : ''}
                </button>
              ) : (
                <span className={styles.toolHint}>
                  Publishing stack is ready once your render is complete.
                </span>
              )}
            </div>
          </section>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside className={styles.sidebarStack}>
            {/* Workflow rail */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Workflow rail</p>
                  <h2 className={styles.cardTitle}>Track the pipeline at a glance.</h2>
                </div>
              </div>
              <div className={styles.workflowRail}>
                {studioSteps.map((step) => {
                  const isActive = step.id === activeStudioStep;
                  const isReady = stepCompletion[step.id];
                  return (
                    <div
                      className={`${styles.workflowStep} ${isReady ? styles.workflowStepReady : ''} ${isActive ? styles.workflowStepCurrent : ''}`}
                      data-current={isActive ? 'true' : 'false'}
                      key={step.id}
                    >
                      <div className={styles.workflowStepTop}>
                        <span className={styles.workflowStepIndex}>{step.eyebrow}</span>
                        <span
                          className={`${styles.workflowStepStatus} ${isReady ? styles.workflowStepStatusReady : ''} ${isActive ? styles.workflowStepStatusCurrent : ''}`}
                        >
                          {isActive ? 'Current step' : isReady ? 'Ready' : step.status}
                        </span>
                      </div>
                      <strong>{step.label}</strong>
                      <p className={styles.workflowStepDetail}>{step.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className={styles.summaryStrip}>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Selected provider</span>
                  <strong>{selectedProvider?.label ?? 'Choose in setup step'}</strong>
                </div>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Publish readiness</span>
                  <strong>{video?.outputUrl ? 'Output available' : 'Waiting for render output'}</strong>
                </div>
              </div>
            </section>

            {/* Live preview */}
            <section className={`${styles.card} ${styles.previewSection}`}>
              <div className={`${styles.cardHeader} ${styles.previewSectionHeader}`}>
                <div>
                  <p className={styles.sectionEyebrow}>Live preview</p>
                  <h2 className={styles.previewSectionTitle}>Preview stays visible while you move.</h2>
                  <p className={styles.previewSectionCopy}>
                    Keep the current output and render context in view without the sidebar feeling cramped.
                  </p>
                </div>
              </div>
              <div className={styles.previewCanvas}>
                <div className={styles.previewTop}>
                  <div className={`${styles.meta} ${styles.previewMeta}`}>
                    <span className={`${styles.pill} ${styles.previewPill}`}>{selectedProvider?.label ?? provider}</span>
                    {selectedProvider ? <span className={`${styles.pill} ${styles.previewPill}`}>{toPriceTierLabel(selectedProvider.priceTier)}</span> : null}
                    {selectedProvider ? <span className={`${styles.pill} ${styles.previewPill}`}>{selectedProvider.creditCost} credits</span> : null}
                    <span className={`${styles.pill} ${styles.previewPill}`}>{aspectRatio}</span>
                    <span className={`${styles.pill} ${styles.previewPill}`}>{activeStatus}</span>
                  </div>
                  <span className={`${styles.previewSignal} ${styles.previewSignalCompact}`}>Live</span>
                </div>
                <div className={styles.previewScreen}>
                  {previewMediaUrl && !previewPlaybackFailed ? (
                    <>
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
                      <div className={styles.previewOverlay}>
                        <span className={styles.previewLabel}>Generated output</span>
                        <h3 className={styles.previewHeadline}>{video?.title ?? 'Preview ready'}</h3>
                        <p className={styles.previewPrompt}>{prompt}</p>
                      </div>
                    </>
                  ) : previewMediaUrl ? (
                    <div className={styles.previewFallback}>
                      <span className={styles.previewLabel}>Generated output</span>
                      <h3 className={styles.previewHeadline}>{video?.title ?? 'Output is ready'}</h3>
                      <p className={styles.previewPrompt}>
                        This render finished, but the returned asset could not be played inline.
                        Open the output directly from the generated URL below.
                      </p>
                      <a
                        className={styles.secondaryButton}
                        href={previewMediaUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open output
                      </a>
                    </div>
                  ) : (
                    <>
                      <div className={styles.previewGlow} />
                      <div className={styles.previewOverlay}>
                        <span className={styles.previewLabel}>Current prompt</span>
                        <h3 className={styles.previewHeadline}>{video?.title ?? 'Preview'}</h3>
                        <p className={styles.previewPrompt}>{prompt}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className={`${styles.statusGrid} ${styles.previewStatusGrid}`}>
                  <div className={`${styles.statusRow} ${styles.previewStatusRow}`}>
                    <span className={styles.statusLabel}>Video ID</span>
                    <span className={styles.statusValue}>{video?.id ?? 'Waiting for first request'}</span>
                  </div>
                  <div className={`${styles.statusRow} ${styles.previewStatusRow}`}>
                    <span className={styles.statusLabel}>Output URL</span>
                    <span className={styles.statusValue}>{video?.outputUrl ?? 'Rendering pipeline not started yet'}</span>
                  </div>
                  <div className={`${styles.statusRow} ${styles.previewStatusRow}`}>
                    <span className={styles.statusLabel}>Voiceover</span>
                    <span className={styles.statusValue}>{video?.voiceoverUrl ?? 'Will appear after orchestration'}</span>
                  </div>
                  <div className={`${styles.statusRow} ${styles.previewStatusRow}`}>
                    <span className={styles.statusLabel}>Subtitles</span>
                    <span className={styles.statusValue}>{video?.subtitlesUrl ?? 'Will appear after orchestration'}</span>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ─── Outer page (loads data, provides context) ────────────────────────────────

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

    return () => { isActive = false; };
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
