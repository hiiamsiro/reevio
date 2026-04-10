'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Dispatch, type SetStateAction, useDeferredValue, useEffect, useState, useTransition } from 'react';
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
  toCtaTypeLabel,
  type CtaType,
  type ExportFormatDefinition,
  type ExportFormatId,
  type HashtagSuggestionSet,
  type HookOption,
  type PostingPreparation,
  type ViralScoreAnalysis,
} from './content-studio';
import styles from './page.module.css';

interface VideoResponse {
  readonly id: string;
  readonly prompt: string;
  readonly provider: string;
  readonly aspectRatio: string;
  readonly status: string;
  readonly title: string | null;
  readonly outputUrl: string | null;
  readonly previewUrl: string | null;
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
  readonly voiceoverUrl?: string | null;
  readonly subtitlesUrl?: string | null;
}

interface ProviderDefinition {
  readonly name: string;
  readonly label: string;
  readonly description: string;
  readonly status: 'available' | 'beta' | 'disabled';
  readonly priceTier: 'free' | 'pro' | 'premium';
  readonly creditCost: number;
}

interface ApiEnvelope<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
}

interface CurrentUser {
  readonly id: string;
  readonly email: string;
  readonly plan: string;
  readonly credits: number;
}

interface GenerateVideoResponse {
  readonly video: VideoResponse;
  readonly remainingCredits: number;
  readonly creditsCharged: boolean;
}

type BulkJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

interface BulkJobItem {
  readonly id: string;
  readonly productDescription: string;
  readonly videoId: string | null;
  readonly status: BulkJobStatus;
  readonly outputUrl: string | null;
  readonly errorMessage: string | null;
}

interface TeamMember {
  readonly id: string;
  readonly email: string;
  readonly role: 'owner' | 'editor';
}

const promptPresets = [
  'Create a vertical sneaker launch ad with chrome lighting, fast macro cuts, and a final 15% off CTA.',
  'Generate a skincare promo with soft glass textures, ingredient callouts, and calm premium narration.',
  'Build a SaaS feature reveal video with bold captions, UI zoom transitions, and a founder-style voiceover.',
];

const styleModes = [
  'Cinematic neon',
  'Clean product studio',
  'Creator UGC',
  'Luxury editorial',
];

const workflowNotes = [
  'Credits are reserved before processing starts.',
  'Failed final renders refund credits automatically.',
  'Preview state refreshes every 2.5 seconds.',
  'Voiceover and subtitles appear after orchestration.',
];
const INITIAL_HOOK_SOURCE = 'Compact espresso machine for busy home baristas';
const INITIAL_PROMPT =
  'Create an affiliate video for a compact espresso machine with strong hook and CTA.';
const CTA_TYPES: CtaType[] = ['urgency', 'scarcity', 'discount'];

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
  const [watermarkPosition, setWatermarkPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
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

    const loadSession = async () => {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
      });
      const payload = (await response.json()) as ApiEnvelope<CurrentUser>;

      if (response.status === 401) {
        router.push('/login');
        router.refresh();
        return;
      }

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? 'Failed to load session.');
      }

      if (!isActive) {
        return;
      }

      setCurrentUser(payload.data);
    };

    const loadProviders = async () => {
      const response = await fetch('/api/providers', {
        cache: 'no-store',
      });
      const payload = (await response.json()) as ApiEnvelope<ProviderDefinition[]>;

      if (response.status === 401) {
        router.push('/login');
        router.refresh();
        return;
      }

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? 'Failed to load providers.');
      }

      if (!isActive) {
        return;
      }

      setProviders(payload.data);
    };

    void Promise.all([loadSession(), loadProviders()]).catch((error: unknown) => {
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
  }, []);

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

    const refreshVideo = async (): Promise<void> => {
      const response = await fetch(`/api/video/${video.id}`, {
        cache: 'no-store',
      });
      const payload = (await response.json()) as ApiEnvelope<VideoResponse>;

      if (response.status === 401) {
        router.push('/login');
        router.refresh();
        return;
      }

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? 'Failed to refresh video.');
      }

      if (payload.data.status === 'failed' || payload.data.status === 'completed') {
        const sessionResponse = await fetch('/api/auth/session', {
          cache: 'no-store',
        });
        const sessionPayload = (await sessionResponse.json()) as ApiEnvelope<CurrentUser>;

        if (sessionResponse.ok && sessionPayload.success && sessionPayload.data) {
          setCurrentUser(sessionPayload.data);
        }
      }

      setVideo(payload.data);
    };

    const intervalId = window.setInterval(() => {
      void refreshVideo().catch((error: unknown) => {
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
          const response = await fetch(`/api/video/${bulkJob.videoId}`, {
            cache: 'no-store',
          });
          const payload = (await response.json()) as ApiEnvelope<VideoResponse>;

          if (response.status === 401) {
            router.push('/login');
            router.refresh();
            throw new Error('Authentication is required.');
          }

          if (!response.ok || !payload.success || !payload.data) {
            throw new Error(payload.error ?? `Failed to refresh bulk job "${bulkJob.id}".`);
          }

          return {
            id: bulkJob.id,
            status: toBulkJobStatus(payload.data.status),
            outputUrl: payload.data.outputUrl,
            errorMessage: payload.data.errorMessage,
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
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          prompt: composedPrompt,
          provider,
          aspectRatio,
        }),
      });

      const payload = (await response.json()) as ApiEnvelope<GenerateVideoResponse>;

      if (response.status === 401) {
        router.push('/login');
        router.refresh();
        return;
      }

      if (!response.ok || !payload.success || !payload.data) {
        setErrorMessage(payload.error ?? 'Failed to generate video.');
        return;
      }

      setVideo(payload.data.video);
      setCurrentUser((previousUser) => {
        if (!previousUser || !payload.data) {
          return previousUser;
        }

        return {
          ...previousUser,
          credits: payload.data.remainingCredits,
        };
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
        const response = await fetch('/api/video', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            prompt: createBulkVideoPrompt(bulkJob.productDescription),
            provider,
            aspectRatio,
          }),
        });
        const payload = (await response.json()) as ApiEnvelope<GenerateVideoResponse>;

        if (response.status === 401) {
          router.push('/login');
          router.refresh();
          throw new Error('Authentication is required.');
        }

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error ?? `Failed to queue "${bulkJob.productDescription}".`);
        }

        return {
          id: bulkJob.id,
          videoId: payload.data.video.id,
          status: toBulkJobStatus(payload.data.video.status),
          outputUrl: payload.data.video.outputUrl,
          errorMessage: payload.data.video.errorMessage,
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
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          prompt: createBulkVideoPrompt(bulkJob.productDescription),
          provider,
          aspectRatio,
        }),
      });
      const payload = (await response.json()) as ApiEnvelope<GenerateVideoResponse>;

      if (response.status === 401) {
        router.push('/login');
        router.refresh();
        throw new Error('Authentication is required.');
      }

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? `Failed to retry "${bulkJob.productDescription}".`);
      }

      const retryVideo = payload.data.video;

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
              <section className={styles.toolPanel} aria-labelledby="hook-generator-title">
                <div className={styles.toolHeader}>
                  <div>
                    <p className={styles.sectionEyebrow}>Phase 25</p>
                    <h3 className={styles.toolTitle} id="hook-generator-title">
                      Viral hook generator
                    </h3>
                  </div>
                  <button
                    className={styles.secondaryButton}
                    onClick={handleGenerateHooks}
                    type="button"
                  >
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
                    onChange={(event) => setHookSource(event.target.value)}
                  />
                </div>

                <div className={styles.toolActions}>
                  <button
                    className={styles.secondaryButton}
                    onClick={handleGenerateHooks}
                    type="button"
                  >
                    Generate 10 hooks
                  </button>
                  <span className={styles.toolHint}>
                    Hooks stay short, emotional, and curiosity-driven.
                  </span>
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
                            onClick={() => handleCopyHook(hookOption)}
                            type="button"
                          >
                            {isCopied ? 'Copied' : 'Copy'}
                          </button>
                          <button
                            className={styles.ghostButton}
                            onClick={() => handleSelectHook(hookOption.id)}
                            type="button"
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {hookErrorMessage ? <p className={styles.error}>{hookErrorMessage}</p> : null}
              </section>

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

              <section className={styles.toolPanel} aria-labelledby="cta-engine-title">
                <div className={styles.toolHeader}>
                  <div>
                    <p className={styles.sectionEyebrow}>Phase 26</p>
                    <h3 className={styles.toolTitle} id="cta-engine-title">
                      CTA engine
                    </h3>
                  </div>
                  <button
                    className={styles.secondaryButton}
                    onClick={handleRegenerateCta}
                    type="button"
                  >
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
                        onClick={() => handleSelectCtaType(type)}
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
                    onChange={(event) => setCtaText(event.target.value)}
                  />
                </div>
              </section>

              <section className={styles.toolPanel} aria-labelledby="bulk-generation-title">
                <div className={styles.toolHeader}>
                  <div>
                    <p className={styles.sectionEyebrow}>Phase 28</p>
                    <h3 className={styles.toolTitle} id="bulk-generation-title">
                      Bulk generation
                    </h3>
                  </div>
                  <div className={styles.progressActions}>
                    <button
                      className={styles.secondaryButton}
                      onClick={() => void handleGenerateBulk()}
                      disabled={isBulkGenerating}
                      type="button"
                    >
                      {isBulkGenerating ? 'Generating...' : 'Generate all'}
                    </button>
                    <button
                      className={styles.ghostButton}
                      onClick={handleRetryFailedBulkJobs}
                      type="button"
                    >
                      Retry failed only
                    </button>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="bulkInput">
                    Upload list or paste one product per line
                  </label>
                  <textarea
                    id="bulkInput"
                    className={styles.textarea}
                    value={bulkInput}
                    onChange={(event) => setBulkInput(event.target.value)}
                  />
                </div>

                <input
                  accept=".txt,.csv"
                  className={styles.fileInput}
                  onChange={(event) => void handleBulkFileUpload(event)}
                  type="file"
                />

                <p className={styles.toolHint}>Phase 39: retry failed steps only from the current bulk run.</p>

                <div className={styles.progressList}>
                  {bulkJobs.length === 0 ? (
                    <div className={styles.noteCard}>Bulk progress will appear here after you queue the list.</div>
                  ) : (
                    bulkJobs.map((bulkJob) => (
                      <article className={styles.progressCard} key={bulkJob.id}>
                        <div>
                          <p className={styles.hookText}>{bulkJob.productDescription}</p>
                          <p className={styles.toolHint}>
                            {bulkJob.status}
                            {bulkJob.videoId ? ` · ${bulkJob.videoId}` : ''}
                          </p>
                        </div>
                        <div className={styles.progressActions}>
                          {bulkJob.outputUrl ? (
                            <a
                              className={styles.ghostButton}
                              href={bulkJob.outputUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Open
                            </a>
                          ) : null}
                          {bulkJob.status === 'failed' ? (
                            <button
                              className={styles.ghostButton}
                              onClick={() => void handleRetryBulkJob(bulkJob.id)}
                              type="button"
                            >
                              Retry failed
                            </button>
                          ) : null}
                        </div>
                        {bulkJob.errorMessage ? <p className={styles.error}>{bulkJob.errorMessage}</p> : null}
                      </article>
                    ))
                  )}
                </div>

                {bulkErrorMessage ? <p className={styles.error}>{bulkErrorMessage}</p> : null}
              </section>

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

            <section className={styles.toolPanel} aria-labelledby="export-engine-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Phase 27</p>
                  <h3 className={styles.toolTitle} id="export-engine-title">
                    Multi-format export
                  </h3>
                </div>
                <button
                  className={styles.secondaryButton}
                  onClick={handleDownloadAllFormats}
                  type="button"
                >
                  Download all
                </button>
              </div>

              <div className={styles.exportList}>
                {exportFormats.map((format) => {
                  const isActive = format.id === selectedExportFormat.id;

                  return (
                    <button
                      aria-pressed={isActive}
                      className={`${styles.exportOption} ${isActive ? styles.exportOptionActive : ''}`}
                      key={format.id}
                      onClick={() => setSelectedExportFormatId(format.id)}
                      type="button"
                    >
                      <span className={styles.exportPlatform}>{format.label}</span>
                      <span className={styles.exportMeta}>{format.canvas}</span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.exportPreviewShell}>
                <div
                  className={`${styles.exportPreviewFrame} ${getExportFrameClassName(selectedExportFormat.id, styles)}`}
                >
                  <div className={styles.exportPreviewOverlay}>
                    <span className={styles.selectedHookLabel}>{selectedExportFormat.platform}</span>
                    <strong>{selectedExportFormat.previewHeadline}</strong>
                    <p className={styles.previewPrompt}>{selectedExportFormat.previewBody}</p>
                    <span className={styles.metaBadge}>{selectedExportFormat.ctaLabel}</span>
                  </div>
                </div>

                <div className={styles.selectedHookCard}>
                  <span className={styles.selectedHookLabel}>Layout behavior</span>
                  <strong>{selectedExportFormat.layoutLabel}</strong>
                </div>

                <button
                  className={styles.secondaryButton}
                  onClick={() => handleDownloadFormat(selectedExportFormat)}
                  type="button"
                >
                  Download {selectedExportFormat.label}
                </button>
              </div>
            </section>

            <section className={styles.toolPanel} aria-labelledby="posting-prep-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Phase 29</p>
                  <h3 className={styles.toolTitle} id="posting-prep-title">
                    Posting preparation
                  </h3>
                </div>
                <button
                  className={styles.secondaryButton}
                  onClick={handleRegeneratePostingPreparation}
                  type="button"
                >
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
                    onClick={() => handleCopyPostingField('Title', postingPreparation.title)}
                    type="button"
                  >
                    Copy
                  </button>
                </div>
                <input
                  id="postingTitle"
                  className={styles.textInput}
                  value={postingPreparation.title}
                  onChange={(event) =>
                    handleUpdatePostingPreparation('title', event.target.value)
                  }
                />
              </div>

              <div className={styles.progressCard}>
                <div className={styles.copyBar}>
                  <label className={styles.label} htmlFor="postingCaption">
                    Caption
                  </label>
                  <button
                    className={styles.ghostButton}
                    onClick={() => handleCopyPostingField('Caption', postingPreparation.caption)}
                    type="button"
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  id="postingCaption"
                  className={styles.textarea}
                  value={postingPreparation.caption}
                  onChange={(event) =>
                    handleUpdatePostingPreparation('caption', event.target.value)
                  }
                />
              </div>

              <div className={styles.progressCard}>
                <div className={styles.copyBar}>
                  <label className={styles.label} htmlFor="postingHashtags">
                    Hashtags
                  </label>
                  <button
                    className={styles.ghostButton}
                    onClick={() => handleCopyPostingField('Hashtags', postingPreparation.hashtags)}
                    type="button"
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  id="postingHashtags"
                  className={styles.textarea}
                  value={postingPreparation.hashtags}
                  onChange={(event) =>
                    handleUpdatePostingPreparation('hashtags', event.target.value)
                  }
                />
              </div>

              {postingNotice ? <p className={styles.toolHint}>{postingNotice}</p> : null}
            </section>

            <section className={styles.toolPanel} aria-labelledby="hashtag-generator-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Phase 30</p>
                  <h3 className={styles.toolTitle} id="hashtag-generator-title">
                    Hashtag generator
                  </h3>
                </div>
                <div className={styles.progressActions}>
                  <button
                    className={styles.secondaryButton}
                    onClick={handleRegenerateHashtags}
                    type="button"
                  >
                    Regenerate
                  </button>
                  <button
                    className={styles.ghostButton}
                    onClick={handleCopyHashtags}
                    type="button"
                  >
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
                <button
                  className={styles.secondaryButton}
                  onClick={handleUseHashtagsInPosting}
                  type="button"
                >
                  Use in posting prep
                </button>
              </div>

              {hashtagNotice ? <p className={styles.toolHint}>{hashtagNotice}</p> : null}
            </section>

            <section className={styles.toolPanel} aria-labelledby="trend-engine-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Phase 33</p>
                  <h3 className={styles.toolTitle} id="trend-engine-title">
                    Trending
                  </h3>
                </div>
              </div>

              <div className={styles.progressList}>
                {trendIdeas.map((trendIdea) => (
                  <article className={styles.progressCard} key={trendIdea.topic}>
                    <strong>{trendIdea.topic}</strong>
                    <p className={styles.previewPrompt}>{trendIdea.idea}</p>
                  </article>
                ))}
              </div>
            </section>

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
                      onClick={() => handleApplyTemplate(template.prompt)}
                      type="button"
                    >
                      Preview template
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.toolPanel} aria-labelledby="team-mode-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Phase 35</p>
                  <h3 className={styles.toolTitle} id="team-mode-title">
                    Team mode
                  </h3>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <input
                  className={styles.textInput}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="teammate@example.com"
                  value={inviteEmail}
                />
                <select
                  className={styles.select}
                  onChange={(event) => setInviteRole(event.target.value as 'owner' | 'editor')}
                  value={inviteRole}
                >
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              <button className={styles.secondaryButton} onClick={handleInviteMember} type="button">
                Invite member
              </button>

              <div className={styles.progressList}>
                {teamMembers.map((teamMember) => (
                  <article className={styles.progressCard} key={teamMember.id}>
                    <strong>{teamMember.email}</strong>
                    <span className={styles.metaBadge}>{teamMember.role}</span>
                  </article>
                ))}
              </div>

              {teamNotice ? <p className={styles.toolHint}>{teamNotice}</p> : null}
            </section>

            <section className={styles.toolPanel} aria-labelledby="watermark-title">
              <div className={styles.toolHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Phase 36</p>
                  <h3 className={styles.toolTitle} id="watermark-title">
                    Watermark
                  </h3>
                </div>
              </div>

              <div className={styles.segmentGroup}>
                <button
                  aria-pressed={watermarkType === 'text'}
                  className={`${styles.segmentButton} ${watermarkType === 'text' ? styles.segmentButtonActive : ''}`}
                  onClick={() => setWatermarkType('text')}
                  type="button"
                >
                  Text
                </button>
                <button
                  aria-pressed={watermarkType === 'logo'}
                  className={`${styles.segmentButton} ${watermarkType === 'logo' ? styles.segmentButtonActive : ''}`}
                  onClick={() => setWatermarkType('logo')}
                  type="button"
                >
                  Logo
                </button>
              </div>

              <div className={styles.fieldRow}>
                <input
                  className={styles.textInput}
                  onChange={(event) => setWatermarkText(event.target.value)}
                  value={watermarkText}
                />
                <select
                  className={styles.select}
                  onChange={(event) =>
                    setWatermarkPosition(
                      event.target.value as
                        | 'top-left'
                        | 'top-right'
                        | 'bottom-left'
                        | 'bottom-right'
                    )
                  }
                  value={watermarkPosition}
                >
                  <option value="top-left">Top left</option>
                  <option value="top-right">Top right</option>
                  <option value="bottom-left">Bottom left</option>
                  <option value="bottom-right">Bottom right</option>
                </select>
              </div>

              <div className={styles.watermarkPreview}>
                <span
                  className={`${styles.watermarkBadge} ${getWatermarkPositionClassName(watermarkPosition, styles)}`}
                >
                  {watermarkType === 'logo' ? 'Logo mark' : watermarkText}
                </span>
              </div>
            </section>

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

function toPriceTierLabel(priceTier: ProviderDefinition['priceTier']): string {
  return priceTier.charAt(0).toUpperCase() + priceTier.slice(1);
}

function createExportBrief(input: {
  readonly format: ExportFormatDefinition;
  readonly prompt: string;
  readonly selectedHookText: string | null;
  readonly ctaText: string | null;
}): string {
  const sections = [
    `Format: ${input.format.label}`,
    `Canvas: ${input.format.canvas}`,
    `Layout: ${input.format.layoutLabel}`,
    `Hook: ${input.selectedHookText ?? 'Not selected'}`,
    `CTA: ${input.ctaText?.trim() || 'Not set'}`,
    `Prompt: ${input.prompt.trim() || 'Not set'}`,
  ];

  return sections.join('\n');
}

function downloadTextFile(input: { readonly content: string; readonly fileName: string }): void {
  const blob = new Blob([input.content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = input.fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 0);
}

function getExportFrameClassName(
  exportFormatId: ExportFormatId,
  classNames: Record<string, string>
): string {
  if (exportFormatId === 'instagram-1x1') {
    return classNames.exportPreviewSquare;
  }

  if (exportFormatId === 'instagram-4x5') {
    return classNames.exportPreviewPortrait;
  }

  return classNames.exportPreviewTall;
}

function getWatermarkPositionClassName(
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  classNames: Record<string, string>
): string {
  if (watermarkPosition === 'top-left') {
    return classNames.watermarkTopLeft;
  }

  if (watermarkPosition === 'top-right') {
    return classNames.watermarkTopRight;
  }

  if (watermarkPosition === 'bottom-left') {
    return classNames.watermarkBottomLeft;
  }

  return classNames.watermarkBottomRight;
}

function toBulkJobStatus(videoStatus: string): BulkJobStatus {
  if (videoStatus === 'completed') {
    return 'completed';
  }

  if (videoStatus === 'failed') {
    return 'failed';
  }

  if (videoStatus === 'processing') {
    return 'processing';
  }

  return 'queued';
}

async function refreshCurrentUser(
  setCurrentUser: Dispatch<SetStateAction<CurrentUser | null>>
): Promise<void> {
  const response = await fetch('/api/auth/session', {
    cache: 'no-store',
  });
  const payload = (await response.json()) as ApiEnvelope<CurrentUser>;

  if (response.ok && payload.success && payload.data) {
    setCurrentUser(payload.data);
  }
}
