'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDeferredValue, useEffect, useState, useTransition } from 'react';
import {
  buildPromptWithCreativeDirectives,
  createBulkVideoPrompt,
  createExportFormats,
  createHashtagSuggestionSet,
  createCtaText,
  createHookOptions,
  createPostingPreparation,
  createRewriteVariations,
  createTrendIdeas,
  createVideoTemplates,
  createViralScoreAnalysis,
  parseBulkProductList,
  type CtaType,
  type ExportFormatDefinition,
  type ExportFormatId,
  type HashtagSuggestionSet,
  type HookOption,
  type PostingPreparation,
  type ViralScoreAnalysis,
} from './content-studio';
import {
  INITIAL_HOOK_SOURCE,
  INITIAL_PROMPT,
  promptPresets,
  styleModes,
  workflowNotes,
} from './page.constants';
import {
  createExportBrief,
  createPerformanceInsight,
  downloadTextFile,
  toBulkJobStatus,
  toPriceTierLabel,
} from './page.helpers';
import {
  loadCurrentUser,
  loadProviders,
  loadVideo,
  refreshCurrentUser,
  requestVideoGeneration,
  submitVideoRequest,
} from './page.api';
import {
  BulkGenerationPanel,
  CtaEnginePanel,
  ExportPanel,
  HashtagGeneratorPanel,
  HookGeneratorPanel,
  PerformanceAiPanel,
  PostingPreparationPanel,
  TeamModePanel,
  TemplateGalleryPanel,
  TrendIdeasPanel,
  WatermarkPanel,
} from './components';
import type {
  BulkJobItem,
  CurrentUser,
  ProviderDefinition,
  TeamMember,
  VideoResponse,
  WatermarkPosition,
} from './page.types';
import styles from './page.module.css';

export default function CreateVideoPage() {
  const router = useRouter();
  const [hookSource, setHookSource] = useState(INITIAL_HOOK_SOURCE);
  const [hookSeed, setHookSeed] = useState(0);
  const [hookOptions, setHookOptions] = useState<HookOption[]>(() =>
    createHookOptions({
      productDescription: INITIAL_HOOK_SOURCE,
      seed: 0,
    })
  );
  const [selectedHookId, setSelectedHookId] = useState<string | null>(null);
  const [copiedHookId, setCopiedHookId] = useState<string | null>(null);
  const [hookErrorMessage, setHookErrorMessage] = useState<string | null>(null);
  const [ctaType, setCtaType] = useState<CtaType>('urgency');
  const [ctaSeed, setCtaSeed] = useState(0);
  const [ctaText, setCtaText] = useState(() =>
    createCtaText({
      productDescription: INITIAL_HOOK_SOURCE,
      seed: 0,
      type: 'urgency',
    })
  );
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [provider, setProvider] = useState('remotion');
  const [providers, setProviders] = useState<ProviderDefinition[]>([]);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [selectedExportFormatId, setSelectedExportFormatId] =
    useState<ExportFormatId>('tiktok-9x16');
  const [bulkInput, setBulkInput] = useState(
    'Compact espresso machine\nVitamin C serum kit\nAI subtitle generator'
  );
  const [bulkJobs, setBulkJobs] = useState<BulkJobItem[]>([]);
  const [bulkErrorMessage, setBulkErrorMessage] = useState<string | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [postingPreparation, setPostingPreparation] = useState<PostingPreparation>(() =>
    createPostingPreparation({
      prompt: INITIAL_PROMPT,
      selectedHookText: null,
      ctaText: createCtaText({
        productDescription: INITIAL_HOOK_SOURCE,
        seed: 0,
        type: 'urgency',
      }),
    })
  );
  const [postingNotice, setPostingNotice] = useState<string | null>(null);
  const [hashtagSeed, setHashtagSeed] = useState(0);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<HashtagSuggestionSet>(() =>
    createHashtagSuggestionSet({
      prompt: INITIAL_PROMPT,
      seed: 0,
    })
  );
  const [hashtagNotice, setHashtagNotice] = useState<string | null>(null);
  const [selectedRewriteIndex, setSelectedRewriteIndex] = useState(0);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'editor'>('editor');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'team-owner',
      email: 'owner@reevio.app',
      role: 'owner',
    },
  ]);
  const [teamNotice, setTeamNotice] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'logo'>('text');
  const [watermarkText, setWatermarkText] = useState('Reevio');
  const [watermarkPosition, setWatermarkPosition] =
    useState<WatermarkPosition>('bottom-right');
  const [referralCode] = useState('REEVIO-START');
  const [referralCredits] = useState(30);
  const [autoMachineNotice, setAutoMachineNotice] = useState<string | null>(null);
  const [views, setViews] = useState('12000');
  const [likes, setLikes] = useState('840');
  const [watchTime, setWatchTime] = useState('18');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const deferredPrompt = useDeferredValue(prompt);
  const selectedHook = hookOptions.find((hookOption) => hookOption.id === selectedHookId) ?? null;
  const composedPrompt = buildPromptWithCreativeDirectives({
    prompt,
    selectedHookText: selectedHook?.text ?? null,
    ctaText,
  });
  const previewPrompt =
    video?.prompt ??
    buildPromptWithCreativeDirectives({
      prompt: deferredPrompt,
      selectedHookText: selectedHook?.text ?? null,
      ctaText,
    });
  const exportFormats = createExportFormats({
    prompt,
    selectedHookText: selectedHook?.text ?? null,
    ctaText,
  });
  const selectedExportFormat =
    exportFormats.find((format) => format.id === selectedExportFormatId) ?? exportFormats[0];
  const viralScoreAnalysis: ViralScoreAnalysis = createViralScoreAnalysis({
    prompt,
    selectedHookText: selectedHook?.text ?? null,
    ctaText,
  });
  const rewriteVariations = createRewriteVariations({
    prompt,
    selectedHookText: selectedHook?.text ?? null,
    ctaText,
  });
  const activeRewriteVariation = rewriteVariations[selectedRewriteIndex] ?? rewriteVariations[0];
  const trendIdeas = createTrendIdeas(prompt);
  const videoTemplates = createVideoTemplates();
  const selectedProvider =
    providers.find((providerDefinition) => providerDefinition.name === provider) ?? null;
  const storageUrl =
    video?.outputUrl ??
    `https://cdn.reevio.app/secure/${provider}/${aspectRatio.replace(':', 'x')}/preview.mp4`;
  const monitoringStats = {
    failedJobs: bulkJobs.filter((bulkJob) => bulkJob.status === 'failed').length,
    activeJobs: bulkJobs.filter(
      (bulkJob) => bulkJob.status === 'queued' || bulkJob.status === 'processing'
    ).length,
    latestError: bulkJobs.find((bulkJob) => bulkJob.errorMessage)?.errorMessage ?? 'No recent failures.',
  };
  const performanceInsight = createPerformanceInsight({
    views,
    likes,
    watchTime,
  });
  const hasEnoughCredits =
    currentUser !== null && selectedProvider !== null
      ? currentUser.credits >= selectedProvider.creditCost
      : false;
  const isLowCredit =
    currentUser !== null && selectedProvider !== null
      ? currentUser.credits < selectedProvider.creditCost * 2
      : false;

  useEffect(() => {
    let isActive = true;

    void Promise.all([loadCurrentUser(router), loadProviders(router)])
      .then(([session, providerList]) => {
        if (!isActive || !session || !providerList) {
          return;
        }

        setCurrentUser(session);
        setProviders(providerList);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Failed to load providers.');
        }
      });

    return () => {
      isActive = false;
    };
  }, [router]);

  useEffect(() => {
    if (providers.length === 0) {
      return;
    }

    if (providers.some((providerDefinition) => providerDefinition.name === provider)) {
      return;
    }

    setProvider(providers[0].name);
  }, [provider, providers]);

  useEffect(() => {
    if (!video?.id) {
      return;
    }

    if (video.status === 'completed' || video.status === 'failed') {
      return;
    }

    const refreshVideoStatus = async (): Promise<void> => {
      const nextVideo = await loadVideo(video.id, router, 'Failed to refresh video.');

      if (!nextVideo) {
        return;
      }

      if (nextVideo.status === 'failed' || nextVideo.status === 'completed') {
        await refreshCurrentUser(setCurrentUser);
      }

      setVideo(nextVideo);
    };

    const intervalId = window.setInterval(() => {
      void refreshVideoStatus().catch((error: unknown) => {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Failed to refresh video.');
        }
      });
    }, 2500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [video?.id, video?.status]);

  useEffect(() => {
    const pendingBulkJobs = bulkJobs.filter(
      (bulkJob) => bulkJob.videoId && bulkJob.status !== 'completed' && bulkJob.status !== 'failed'
    );

    if (pendingBulkJobs.length === 0) {
      return;
    }

    const refreshBulkJobs = async (): Promise<void> => {
      const refreshedJobs = await Promise.all(
        pendingBulkJobs.map(async (bulkJob) => {
          const nextVideo = await loadVideo(
            bulkJob.videoId!,
            router,
            `Failed to refresh bulk job "${bulkJob.id}".`
          );

          if (!nextVideo) {
            throw new Error('Authentication is required.');
          }

          return {
            id: bulkJob.id,
            status: toBulkJobStatus(nextVideo.status),
            outputUrl: nextVideo.outputUrl,
            errorMessage: nextVideo.errorMessage,
          };
        })
      );

      setBulkJobs((previousJobs) =>
        previousJobs.map((bulkJob) => {
          const refreshedJob = refreshedJobs.find((item) => item.id === bulkJob.id);

          if (!refreshedJob) {
            return bulkJob;
          }

          return {
            ...bulkJob,
            status: refreshedJob.status,
            outputUrl: refreshedJob.outputUrl,
            errorMessage: refreshedJob.errorMessage,
          };
        })
      );
    };

    const intervalId = window.setInterval(() => {
      void refreshBulkJobs().catch((error: unknown) => {
        if (error instanceof Error) {
          setBulkErrorMessage(error.message);
          return;
        }

        setBulkErrorMessage('Failed to refresh bulk jobs.');
      });
    }, 2500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [bulkJobs]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      await submitVideoRequest({
        promptToSend: composedPrompt,
        router,
        provider,
        aspectRatio,
        setVideo,
        setCurrentUser,
        setErrorMessage,
      });
    });
  };

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    setErrorMessage(null);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      router.push('/login');
      router.refresh();
      setIsLoggingOut(false);
    }
  };

  const handleGenerateHooks = (): void => {
    const normalizedHookSource = hookSource.trim();

    if (normalizedHookSource.length === 0) {
      setHookErrorMessage('Enter a product description before generating hooks.');
      return;
    }

    const nextSeed = hookSeed + 1;

    setHookSeed(nextSeed);
    setHookOptions(
      createHookOptions({
        productDescription: normalizedHookSource,
        seed: nextSeed,
      })
    );
    setSelectedHookId(null);
    setCopiedHookId(null);
    setHookErrorMessage(null);
  };

  const handleSelectHook = (hookId: string): void => {
    setSelectedHookId(hookId);
  };

  const handleCopyHook = (hook: HookOption): void => {
    if (!navigator.clipboard) {
      setHookErrorMessage('Clipboard is unavailable in this browser. Select the hook and copy manually.');
      return;
    }

    void navigator.clipboard
      .writeText(hook.text)
      .then(() => {
        setCopiedHookId(hook.id);
        setHookErrorMessage(null);
      })
      .catch(() => {
        setHookErrorMessage('Clipboard access failed. Select the hook and copy manually.');
      });
  };

  const handleRegenerateCta = (): void => {
    const nextSeed = ctaSeed + 1;

    setCtaSeed(nextSeed);
    setCtaText(
      createCtaText({
        productDescription: hookSource,
        seed: nextSeed,
        type: ctaType,
      })
    );
  };

  const handleSelectCtaType = (type: CtaType): void => {
    setCtaType(type);
    setCtaSeed(0);
    setCtaText(
      createCtaText({
        productDescription: hookSource,
        seed: 0,
        type,
      })
    );
  };

  const handleDownloadFormat = (format: ExportFormatDefinition): void => {
    const fileContent = createExportBrief({
      format,
      prompt,
      selectedHookText: selectedHook?.text ?? null,
      ctaText,
    });

    downloadTextFile({
      content: fileContent,
      fileName: `${format.id}-export-brief.txt`,
    });
  };

  const handleDownloadAllFormats = (): void => {
    const fileContent = exportFormats
      .map((format) =>
        createExportBrief({
          format,
          prompt,
          selectedHookText: selectedHook?.text ?? null,
          ctaText,
        })
      )
      .join('\n\n------------------------------\n\n');

    downloadTextFile({
      content: fileContent,
      fileName: 'multi-format-export-brief.txt',
    });
  };

  const handleBulkFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const uploadedFile = event.target.files?.[0];

    if (!uploadedFile) {
      return;
    }

    try {
      const fileContent = await uploadedFile.text();

      setBulkInput(fileContent);
      setBulkErrorMessage(null);
    } catch {
      setBulkErrorMessage('Failed to read the uploaded list.');
    }
  };

  const handleGenerateBulk = async (): Promise<void> => {
    if (isBulkGenerating) {
      return;
    }

    const productDescriptions = parseBulkProductList(bulkInput);

    if (productDescriptions.length === 0) {
      setBulkErrorMessage('Add at least one product description before bulk generation.');
      return;
    }

    const initialBulkJobs = productDescriptions.map((productDescription, index) => ({
      id: `bulk-${Date.now()}-${index + 1}`,
      productDescription,
      videoId: null,
      status: 'processing' as const,
      outputUrl: null,
      errorMessage: null,
    }));

    setBulkJobs(initialBulkJobs);
    setBulkErrorMessage(null);
    setIsBulkGenerating(true);

    const settledJobs = await Promise.allSettled(
      initialBulkJobs.map(async (bulkJob) => {
        const result = await requestVideoGeneration({
          prompt: createBulkVideoPrompt(bulkJob.productDescription),
          provider,
          aspectRatio,
          router,
          fallbackError: `Failed to queue "${bulkJob.productDescription}".`,
        });

        return {
          id: bulkJob.id,
          videoId: result.video.id,
          status: toBulkJobStatus(result.video.status),
          outputUrl: result.video.outputUrl,
          errorMessage: result.video.errorMessage,
        };
      })
    );

    setBulkJobs((previousJobs) =>
      previousJobs.map((bulkJob, index) => {
        const settledJob = settledJobs[index];

        if (!settledJob || settledJob.status === 'rejected') {
          return {
            ...bulkJob,
            status: 'failed',
            errorMessage:
              settledJob?.reason instanceof Error
                ? settledJob.reason.message
                : 'Failed to queue the bulk generation request.',
          };
        }

        return {
          ...bulkJob,
          videoId: settledJob.value.videoId,
          status: settledJob.value.status,
          outputUrl: settledJob.value.outputUrl,
          errorMessage: settledJob.value.errorMessage,
        };
      })
    );

    setIsBulkGenerating(false);
    void refreshCurrentUser(setCurrentUser).catch(() => {
      setBulkErrorMessage('Bulk generation completed, but credits could not be refreshed.');
    });
  };

  const handleRetryBulkJob = async (bulkJobId: string): Promise<void> => {
    const bulkJob = bulkJobs.find((item) => item.id === bulkJobId);

    if (!bulkJob) {
      return;
    }

    setBulkJobs((previousJobs) =>
      previousJobs.map((item) =>
        item.id === bulkJobId
          ? {
              ...item,
              status: 'processing',
              errorMessage: null,
            }
          : item
      )
    );

    try {
      const result = await requestVideoGeneration({
        prompt: createBulkVideoPrompt(bulkJob.productDescription),
        provider,
        aspectRatio,
        router,
        fallbackError: `Failed to retry "${bulkJob.productDescription}".`,
      });
      const retryVideo = result.video;

      setBulkJobs((previousJobs) =>
        previousJobs.map((item) =>
          item.id === bulkJobId
            ? {
                ...item,
                videoId: retryVideo.id,
                status: toBulkJobStatus(retryVideo.status),
                outputUrl: retryVideo.outputUrl,
                errorMessage: retryVideo.errorMessage,
              }
            : item
        )
      );
      void refreshCurrentUser(setCurrentUser).catch(() => {
        setBulkErrorMessage('Retry succeeded, but credits could not be refreshed.');
      });
    } catch (error: unknown) {
      setBulkJobs((previousJobs) =>
        previousJobs.map((item) =>
          item.id === bulkJobId
            ? {
                ...item,
                status: 'failed',
                errorMessage:
                  error instanceof Error ? error.message : 'Failed to retry the bulk generation request.',
              }
            : item
        )
      );
    }
  };

  const handleRetryFailedBulkJobs = (): void => {
    const failedBulkJobs = bulkJobs.filter((bulkJob) => bulkJob.status === 'failed');

    failedBulkJobs.forEach((bulkJob) => {
      void handleRetryBulkJob(bulkJob.id);
    });
  };

  const handleRegeneratePostingPreparation = (): void => {
    setPostingPreparation(
      createPostingPreparation({
        prompt,
        selectedHookText: selectedHook?.text ?? null,
        ctaText,
      })
    );
    setPostingNotice(null);
  };

  const handleUpdatePostingPreparation = (
    field: keyof PostingPreparation,
    value: string
  ): void => {
    setPostingPreparation((previousPostingPreparation) => ({
      ...previousPostingPreparation,
      [field]: value,
    }));
  };

  const handleCopyPostingField = (label: string, value: string): void => {
    if (!navigator.clipboard) {
      setPostingNotice('Clipboard is unavailable in this browser. Copy manually.');
      return;
    }

    void navigator.clipboard
      .writeText(value)
      .then(() => {
        setPostingNotice(`${label} copied.`);
      })
      .catch(() => {
        setPostingNotice(`Failed to copy ${label.toLowerCase()}.`);
      });
  };

  const handleRegenerateHashtags = (): void => {
    const nextSeed = hashtagSeed + 1;

    setHashtagSeed(nextSeed);
    setHashtagSuggestions(
      createHashtagSuggestionSet({
        prompt,
        seed: nextSeed,
      })
    );
    setHashtagNotice(null);
  };

  const handleCopyHashtags = (): void => {
    if (!navigator.clipboard) {
      setHashtagNotice('Clipboard is unavailable in this browser. Copy manually.');
      return;
    }

    void navigator.clipboard
      .writeText(hashtagSuggestions.combined)
      .then(() => {
        setHashtagNotice('Hashtag set copied.');
      })
      .catch(() => {
        setHashtagNotice('Failed to copy hashtags.');
      });
  };

  const handleUseHashtagsInPosting = (): void => {
    setPostingPreparation((previousPostingPreparation) => ({
      ...previousPostingPreparation,
      hashtags: hashtagSuggestions.combined,
    }));
    setHashtagNotice('Hashtag set moved into posting preparation.');
  };

  const handleApplyRewriteVariation = (): void => {
    setPrompt(activeRewriteVariation);
  };

  const handleApplyTemplate = (templatePrompt: string): void => {
    setPrompt(templatePrompt);
    setHookSource(templatePrompt);
  };

  const handleInviteMember = (): void => {
    const normalizedEmail = inviteEmail.trim();

    if (normalizedEmail.length === 0) {
      setTeamNotice('Enter an email before sending an invite.');
      return;
    }

    setTeamMembers((previousMembers) => [
      ...previousMembers,
      {
        id: `team-${previousMembers.length + 1}`,
        email: normalizedEmail,
        role: inviteRole,
      },
    ]);
    setInviteEmail('');
    setInviteRole('editor');
    setTeamNotice(`Invite prepared for ${normalizedEmail}.`);
  };

  const handleCopyStorageUrl = (): void => {
    if (!navigator.clipboard) {
      setErrorMessage('Clipboard is unavailable in this browser. Copy manually.');
      return;
    }

    void navigator.clipboard
      .writeText(storageUrl)
      .then(() => {
        setErrorMessage(null);
      })
      .catch(() => {
        setErrorMessage('Failed to copy the delivery URL.');
      });
  };

  const handleCopyReferralCode = (): void => {
    if (!navigator.clipboard) {
      setErrorMessage('Clipboard is unavailable in this browser. Copy manually.');
      return;
    }

    void navigator.clipboard.writeText(referralCode).catch(() => {
      setErrorMessage('Failed to copy the referral code.');
      });
  };

  const handleRunAutoContentMachine = (): void => {
    const autoHooks = createHookOptions({
      productDescription: hookSource,
      seed: 0,
    });
    const autoHook = autoHooks[0] ?? null;
    const autoCtaText = createCtaText({
      productDescription: hookSource,
      seed: 0,
      type: 'urgency',
    });
    const autoPrompt =
      hookSource.trim().length > 0
        ? `Create a ready-to-publish affiliate video for ${hookSource.trim()} with auto script, auto video, and auto voiceover.`
        : 'Create a ready-to-publish affiliate video with auto script, auto video, and auto voiceover.';

    setHookOptions(autoHooks);
    setSelectedHookId(autoHook?.id ?? null);
    setCtaText(autoCtaText);
    setPrompt(autoPrompt);
    setAutoMachineNotice('Auto pipeline prepared for 1-click generation.');

    startTransition(async () => {
      await submitVideoRequest({
        promptToSend: buildPromptWithCreativeDirectives({
          prompt: autoPrompt,
          selectedHookText: autoHook?.text ?? null,
          ctaText: autoCtaText,
        }),
        router,
        provider,
        aspectRatio,
        setVideo,
        setCurrentUser,
        setErrorMessage,
      });
    });
  };

  const activeStatus = video?.status ?? (isPending ? 'queued' : 'ready');

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.shell}>
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
            <button
              className={styles.navLink}
              onClick={handleLogout}
              type="button"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Signing out...' : 'Log out'}
            </button>
            <Link className={styles.navLink} href="/pricing">
              Buy credits
            </Link>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Create video</p>
            <h1 className={styles.title}>Generate, preview, and route renders inside the same visual system.</h1>
            <p className={styles.subtitle}>
              This editor now follows the same dark glass surface as the landing page, with vibrant
              accents for prompts, provider state, and render feedback.
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

        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Prompt studio</p>
                <h2 className={styles.cardTitle}>Shape the brief before you spend credits.</h2>
              </div>
              <div className={styles.metaCluster}>
                <span className={styles.metaBadge}>
                  {currentUser ? `${currentUser.credits} credits` : 'Loading credits'}
                </span>
                {selectedProvider ? (
                  <span className={styles.metaBadge}>{selectedProvider.creditCost} credits / render</span>
                ) : null}
                <span className={styles.metaBadge}>Authenticated session</span>
              </div>
            </div>

            <div className={styles.presetGrid}>
              {promptPresets.map((preset, index) => (
                <button
                  className={styles.presetCard}
                  key={preset}
                  onClick={() => setPrompt(preset)}
                  type="button"
                >
                  <span className={styles.presetIndex}>0{index + 1}</span>
                  <span>{preset}</span>
                </button>
              ))}
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <HookGeneratorPanel
                copiedHookId={copiedHookId}
                errorMessage={hookErrorMessage}
                hookOptions={hookOptions}
                hookSource={hookSource}
                onCopyHook={handleCopyHook}
                onGenerateHooks={handleGenerateHooks}
                onHookSourceChange={setHookSource}
                onSelectHook={handleSelectHook}
                selectedHook={selectedHook}
                selectedHookId={selectedHookId}
              />

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="prompt">
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  className={styles.textarea}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
              </div>

              <CtaEnginePanel
                ctaText={ctaText}
                ctaType={ctaType}
                onCtaTextChange={setCtaText}
                onRegenerateCta={handleRegenerateCta}
                onSelectCtaType={handleSelectCtaType}
              />

              <BulkGenerationPanel
                bulkInput={bulkInput}
                bulkJobs={bulkJobs}
                errorMessage={bulkErrorMessage}
                isBulkGenerating={isBulkGenerating}
                onBulkFileUpload={handleBulkFileUpload}
                onBulkInputChange={setBulkInput}
                onGenerateBulk={handleGenerateBulk}
                onRetryBulkJob={handleRetryBulkJob}
                onRetryFailedBulkJobs={handleRetryFailedBulkJobs}
              />

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="provider">
                    Provider
                  </label>
                  <select
                    id="provider"
                    className={styles.select}
                    value={provider}
                    onChange={(event) => setProvider(event.target.value)}
                    disabled={providers.length === 0}
                  >
                    {providers.map((providerDefinition) => (
                      <option key={providerDefinition.name} value={providerDefinition.name}>
                        {providerDefinition.label} - {toPriceTierLabel(providerDefinition.priceTier)} -{' '}
                        {providerDefinition.creditCost} credits
                      </option>
                    ))}
                  </select>

                  {selectedProvider ? (
                    <div className={styles.providerMeta}>
                      <span className={styles.metaBadge}>
                        {toPriceTierLabel(selectedProvider.priceTier)}
                      </span>
                      <span className={styles.metaBadge}>{selectedProvider.status}</span>
                    </div>
                  ) : null}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="aspectRatio">
                    Aspect ratio
                  </label>
                  <select
                    id="aspectRatio"
                    className={styles.select}
                    value={aspectRatio}
                    onChange={(event) => setAspectRatio(event.target.value)}
                  >
                    <option value="9:16">9:16</option>
                    <option value="16:9">16:9</option>
                    <option value="1:1">1:1</option>
                    <option value="4:5">4:5</option>
                  </select>
                </div>
              </div>

              {selectedProvider ? (
                <div className={styles.providerCard}>
                  <div>
                    <p className={styles.providerLabel}>Provider profile</p>
                    <h3>{selectedProvider.label}</h3>
                  </div>
                  <p>
                    {selectedProvider.description} This render costs {selectedProvider.creditCost}{' '}
                    credits.
                  </p>
                </div>
              ) : null}

              {selectedProvider && currentUser ? (
                <div className={styles.providerCard}>
                  <div>
                    <p className={styles.providerLabel}>Credit status</p>
                    <h3>{hasEnoughCredits ? 'Ready to generate' : 'Insufficient credits'}</h3>
                  </div>
                  <p>
                    {hasEnoughCredits
                      ? isLowCredit
                        ? `You have ${currentUser.credits} credits left, so you are close to your threshold for ${selectedProvider.label}. Open Buy credits when you need a top-up.`
                        : `You have ${currentUser.credits} credits available for this ${selectedProvider.creditCost}-credit render.`
                      : `You need ${selectedProvider.creditCost} credits but only have ${currentUser.credits}. Failed final renders refund automatically, and you can top up from Buy credits.`}
                  </p>
                </div>
              ) : null}

              <div className={styles.toolPanel} aria-labelledby="viral-score-title">
                <div className={styles.toolHeader}>
                  <div>
                    <p className={styles.sectionEyebrow}>Phase 31</p>
                    <h3 className={styles.toolTitle} id="viral-score-title">
                      Viral score
                    </h3>
                  </div>
                  <span className={styles.scoreBadge}>{viralScoreAnalysis.score}/100</span>
                </div>

                <div className={styles.scoreGrid}>
                  <div className={styles.heroMetric}>
                    <span>Hook</span>
                    <strong>{viralScoreAnalysis.hook}</strong>
                  </div>
                  <div className={styles.heroMetric}>
                    <span>Emotion</span>
                    <strong>{viralScoreAnalysis.emotion}</strong>
                  </div>
                  <div className={styles.heroMetric}>
                    <span>Length</span>
                    <strong>{viralScoreAnalysis.length}</strong>
                  </div>
                </div>
              </div>

              <section className={styles.toolPanel} aria-labelledby="rewrite-engine-title">
                <div className={styles.toolHeader}>
                  <div>
                    <p className={styles.sectionEyebrow}>Phase 32</p>
                    <h3 className={styles.toolTitle} id="rewrite-engine-title">
                      Rewrite engine
                    </h3>
                  </div>
                  <button
                    className={styles.secondaryButton}
                    onClick={handleApplyRewriteVariation}
                    type="button"
                  >
                    Use selected version
                  </button>
                </div>

                <div className={styles.segmentGroup}>
                  {rewriteVariations.map((variation, index) => {
                    const isActive = index === selectedRewriteIndex;

                    return (
                      <button
                        aria-pressed={isActive}
                        className={`${styles.segmentButton} ${isActive ? styles.segmentButtonActive : ''}`}
                        key={variation}
                        onClick={() => setSelectedRewriteIndex(index)}
                        type="button"
                      >
                        V{index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className={styles.progressCard}>
                  <p className={styles.previewPrompt}>{activeRewriteVariation}</p>
                </div>
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
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Live preview</p>
                <h2 className={styles.cardTitle}>See the render state update in real time.</h2>
              </div>
            </div>

            <div className={styles.previewCanvas}>
              <div className={styles.previewTop}>
                <div className={styles.meta}>
                  <span className={styles.pill}>{selectedProvider?.label ?? provider}</span>
                  {selectedProvider ? (
                    <span className={styles.pill}>
                      {toPriceTierLabel(selectedProvider.priceTier)}
                    </span>
                  ) : null}
                  {selectedProvider ? <span className={styles.pill}>{selectedProvider.creditCost} credits</span> : null}
                  <span className={styles.pill}>{aspectRatio}</span>
                  <span className={styles.pill}>{activeStatus}</span>
                </div>
                <span className={styles.previewSignal}>Auto refresh every 2.5s</span>
              </div>

              <div className={styles.previewScreen}>
                <div className={styles.previewGlow} />
                <div className={styles.previewOverlay}>
                  <span className={styles.previewLabel}>Current prompt</span>
                  <h3 className={styles.previewHeadline}>{video?.title ?? 'Prompt preview'}</h3>
                  <p className={styles.previewPrompt}>{previewPrompt}</p>
                </div>
              </div>

              <div className={styles.statusGrid}>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Video ID</span>
                  <span className={styles.statusValue}>{video?.id ?? 'Waiting for first request'}</span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Output URL</span>
                  <span className={styles.statusValue}>
                    {video?.outputUrl ?? 'Rendering pipeline not started yet'}
                  </span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Voiceover</span>
                  <span className={styles.statusValue}>
                    {video?.voiceoverUrl ?? 'Will appear after orchestration'}
                  </span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Subtitles</span>
                  <span className={styles.statusValue}>
                    {video?.subtitlesUrl ?? 'Will appear after orchestration'}
                  </span>
                </div>
              </div>

              {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
              {video?.errorMessage ? <p className={styles.error}>{video.errorMessage}</p> : null}
            </div>

            <ExportPanel
              exportFormats={exportFormats}
              onDownloadAllFormats={handleDownloadAllFormats}
              onDownloadFormat={handleDownloadFormat}
              onSelectExportFormat={setSelectedExportFormatId}
              selectedExportFormat={selectedExportFormat}
            />

            <PostingPreparationPanel
              onCopyPostingField={handleCopyPostingField}
              onRegeneratePostingPreparation={handleRegeneratePostingPreparation}
              onUpdatePostingPreparation={handleUpdatePostingPreparation}
              postingNotice={postingNotice}
              postingPreparation={postingPreparation}
            />

            <HashtagGeneratorPanel
              hashtagNotice={hashtagNotice}
              hashtagSuggestions={hashtagSuggestions}
              onCopyHashtags={handleCopyHashtags}
              onRegenerateHashtags={handleRegenerateHashtags}
              onUseHashtagsInPosting={handleUseHashtagsInPosting}
            />

            <TrendIdeasPanel trendIdeas={trendIdeas} />

            <TemplateGalleryPanel onApplyTemplate={handleApplyTemplate} videoTemplates={videoTemplates} />

            <TeamModePanel
              inviteEmail={inviteEmail}
              inviteRole={inviteRole}
              onInviteEmailChange={setInviteEmail}
              onInviteMember={handleInviteMember}
              onInviteRoleChange={setInviteRole}
              teamMembers={teamMembers}
              teamNotice={teamNotice}
            />

            <WatermarkPanel
              onWatermarkPositionChange={setWatermarkPosition}
              onWatermarkTextChange={setWatermarkText}
              onWatermarkTypeChange={setWatermarkType}
              watermarkPosition={watermarkPosition}
              watermarkText={watermarkText}
              watermarkType={watermarkType}
            />

            <section className={styles.toolPanel} aria-labelledby="storage-cdn-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Phase 37</p>
                  <h3 className={styles.toolTitle} id="storage-cdn-title">
                    Storage + CDN
                  </h3>
                </div>
                <button
                  className={styles.ghostButton}
                  onClick={handleCopyStorageUrl}
                  type="button"
                >
                  Copy URL
                </button>
              </div>

              <div className={styles.progressCard}>
                <strong>Delivery URL</strong>
                <p className={styles.previewPrompt}>{storageUrl}</p>
                <div className={styles.tagList}>
                  <span className={styles.metaBadge}>Fast load</span>
                  <span className={styles.metaBadge}>Secure access</span>
                  <span className={styles.metaBadge}>CDN edge ready</span>
                </div>
              </div>
            </section>

            <section className={styles.toolPanel} aria-labelledby="monitoring-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Phase 38</p>
                  <h3 className={styles.toolTitle} id="monitoring-title">
                    Monitoring
                  </h3>
                </div>
              </div>

              <div className={styles.scoreGrid}>
                <div className={styles.heroMetric}>
                  <span>Failed jobs</span>
                  <strong>{monitoringStats.failedJobs}</strong>
                </div>
                <div className={styles.heroMetric}>
                  <span>Active jobs</span>
                  <strong>{monitoringStats.activeJobs}</strong>
                </div>
                <div className={styles.heroMetric}>
                  <span>System</span>
                  <strong>{monitoringStats.failedJobs === 0 ? 'Healthy' : 'Attention'}</strong>
                </div>
              </div>

              <div className={styles.progressCard}>
                <strong>Latest error</strong>
                <p className={styles.previewPrompt}>{monitoringStats.latestError}</p>
              </div>
            </section>

            <section className={styles.toolPanel} aria-labelledby="referral-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Phase 40</p>
                  <h3 className={styles.toolTitle} id="referral-title">
                    Referral dashboard
                  </h3>
                </div>
                <button
                  className={styles.ghostButton}
                  onClick={handleCopyReferralCode}
                  type="button"
                >
                  Copy code
                </button>
              </div>

              <div className={styles.scoreGrid}>
                <div className={styles.heroMetric}>
                  <span>Referral code</span>
                  <strong>{referralCode}</strong>
                </div>
                <div className={styles.heroMetric}>
                  <span>Reward</span>
                  <strong>{referralCredits} credits</strong>
                </div>
                <div className={styles.heroMetric}>
                  <span>Status</span>
                  <strong>Invite friends</strong>
                </div>
              </div>
            </section>

            <section className={styles.toolPanel} aria-labelledby="auto-machine-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Phase 41</p>
                  <h3 className={styles.toolTitle} id="auto-machine-title">
                    Auto content machine
                  </h3>
                </div>
                <button
                  className={styles.secondaryButton}
                  onClick={handleRunAutoContentMachine}
                  type="button"
                >
                  1-click video
                </button>
              </div>

              <div className={styles.progressCard}>
                <strong>Pipeline</strong>
                <p className={styles.previewPrompt}>Auto script, auto video, auto voiceover, ready output.</p>
              </div>

              {autoMachineNotice ? <p className={styles.toolHint}>{autoMachineNotice}</p> : null}
            </section>

            <PerformanceAiPanel
              likes={likes}
              onLikesChange={setLikes}
              onViewsChange={setViews}
              onWatchTimeChange={setWatchTime}
              performanceInsight={performanceInsight}
              views={views}
              watchTime={watchTime}
            />

            <div className={styles.noteGrid}>
              {workflowNotes.map((note) => (
                <div className={styles.noteCard} key={note}>
                  {note}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
