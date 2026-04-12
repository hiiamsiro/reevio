'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  buildPromptWithCreativeDirectives,
  createBulkVideoPrompt,
  createCtaText,
  createExportFormats,
  createHashtagSuggestionSet,
  createHookOptions,
  createPostingPreparation,
  createRewriteVariations,
  createTrendIdeas,
  createVideoTemplates,
  createViralScoreAnalysis,
  parseBulkProductList,
  type CtaType,
  type ExportFormatId,
  type HookOption,
  type PostingPreparation,
  type TrendIdea,
  type VideoTemplateDefinition,
  type ViralScoreAnalysis,
} from '../content-studio';
import {
  INITIAL_HOOK_SOURCE,
  INITIAL_PROMPT,
  workflowNotes,
} from '../page.constants';
import {
  loadVideo,
  refreshCurrentUser,
  requestVideoGeneration,
  submitVideoRequest,
} from '../page.api';
import {
  createPerformanceInsight,
  toBulkJobStatus,
} from '../page.helpers';
import { useVideoEvents } from '@/lib/use-video-events';
import type {
  AppRouter,
  BulkJobItem,
  CurrentUser,
  ProviderDefinition,
  TeamMember,
  VideoResponse,
  WatermarkPosition,
} from '../page.types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type StudioStep = 'brief' | 'setup' | 'render' | 'publish';

export interface CreateVideoContextValue {
  // Step
  activeStudioStep: StudioStep;
  setActiveStudioStep: (step: StudioStep) => void;
  activeStepIndex: number;
  previousStep: StudioStep | null;
  nextStep: StudioStep | null;
  stepCompletion: Readonly<{ brief: boolean; setup: boolean; render: boolean; publish: boolean }>;

  // Brief state
  hookSource: string;
  onHookSourceChange: (value: string) => void;
  onUseCurrentBrief: () => void;
  hookSeed: number;
  onGenerateHooks: () => void;
  hookOptions: readonly HookOption[];
  selectedHookId: string | null;
  onSelectHook: (hookId: string) => void;
  copiedHookId: string | null;
  onCopyHook: (hook: HookOption) => void;
  hookErrorMessage: string | null;
  ctaType: CtaType;
  ctaSeed: number;
  ctaText: string;
  onCtaTextChange: (value: string) => void;
  onRegenerateCta: () => void;
  onSelectCtaType: (type: CtaType) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  rewriteVariations: readonly string[];
  selectedRewriteIndex: number;
  onSelectedRewriteIndexChange: (index: number) => void;
  onApplyRewriteVariation: () => void;
  trendIdeas: readonly TrendIdea[];
  videoTemplates: readonly VideoTemplateDefinition[];
  onApplyTemplate: (templatePrompt: string) => void;

  // Setup state
  providers: readonly ProviderDefinition[];
  selectedProvider: ProviderDefinition | null;
  provider: string;
  onProviderChange: (value: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  hasEnoughCredits: boolean;
  isLowCredit: boolean;
  bulkInput: string;
  onBulkInputChange: (value: string) => void;
  onBulkFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  bulkJobs: readonly BulkJobItem[];
  onGenerateBulk: () => Promise<void>;
  isBulkGenerating: boolean;
  onRetryBulkJob: (bulkJobId: string) => Promise<void>;
  onRetryFailedBulkJobs: () => void;
  bulkErrorMessage: string | null;
  viralScoreAnalysis: ViralScoreAnalysis;
  currentUser: CurrentUser | null;

  // Render state
  video: VideoResponse | null;
  isPending: boolean;
  autoMachineNotice: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onRunAutoContentMachine: () => void;

  // Publish state
  exportFormats: ReturnType<typeof createExportFormats>;
  selectedExportFormatId: ExportFormatId;
  onSelectExportFormat: (formatId: ExportFormatId) => void;
  onDownloadFormat: (format: ReturnType<typeof createExportFormats>[number]) => void;
  onDownloadAllFormats: () => void;
  postingPreparation: PostingPreparation;
  onRegeneratePostingPreparation: () => void;
  onCopyPostingField: (label: string, value: string) => void;
  onUpdatePostingPreparation: (field: keyof PostingPreparation, value: string) => void;
  postingNotice: string | null;
  hashtagSeed: number;
  hashtagSuggestions: ReturnType<typeof createHashtagSuggestionSet>;
  onRegenerateHashtags: () => void;
  onCopyHashtags: () => void;
  onUseHashtagsInPosting: () => void;
  hashtagNotice: string | null;
  inviteEmail: string;
  onInviteEmailChange: (value: string) => void;
  inviteRole: 'owner' | 'editor';
  onInviteRoleChange: (role: 'owner' | 'editor') => void;
  onInviteMember: () => void;
  teamMembers: readonly TeamMember[];
  teamNotice: string | null;
  watermarkType: 'text' | 'logo';
  onWatermarkTypeChange: (type: 'text' | 'logo') => void;
  watermarkText: string;
  onWatermarkTextChange: (value: string) => void;
  watermarkPosition: WatermarkPosition;
  onWatermarkPositionChange: (position: WatermarkPosition) => void;
  referralCode: string;
  referralCredits: number;
  onCopyReferralCode: () => void;
  onCopyStorageUrl: () => void;
  views: string;
  onViewsChange: (value: string) => void;
  likes: string;
  onLikesChange: (value: string) => void;
  watchTime: string;
  onWatchTimeChange: (value: string) => void;
  performanceInsight: { readonly health: string; readonly suggestion: string };
  storageUrl: string;

  // Derived
  selectedHook: HookOption | null;
  composedPrompt: string;
  studioSteps: readonly {
    id: StudioStep;
    eyebrow: string;
    label: string;
    description: string;
    status: string;
  }[];
}

const CreateVideoContext = createContext<CreateVideoContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface CreateVideoProviderProps {
  readonly children: ReactNode;
  readonly router: AppRouter;
  readonly initialCurrentUser: CurrentUser | null;
  readonly initialProviders: readonly ProviderDefinition[];
}

export function CreateVideoProvider({
  children,
  router,
  initialCurrentUser,
  initialProviders,
}: CreateVideoProviderProps) {
  // ─── Step state ───────────────────────────────────────────────────────────
  const [activeStudioStep, setActiveStudioStep] = useState<StudioStep>('brief');

  // ─── Brief state ──────────────────────────────────────────────────────────
  const [hookSource, setHookSource] = useState(INITIAL_HOOK_SOURCE);
  const [hookSeed, setHookSeed] = useState(0);
  const [hookOptions, setHookOptions] = useState<HookOption[]>(() =>
    createHookOptions({ productDescription: INITIAL_HOOK_SOURCE, seed: 0 })
  );
  const [selectedHookId, setSelectedHookId] = useState<string | null>(null);
  const [copiedHookId, setCopiedHookId] = useState<string | null>(null);
  const [hookErrorMessage, setHookErrorMessage] = useState<string | null>(null);
  const [ctaType, setCtaType] = useState<CtaType>('urgency');
  const [ctaSeed, setCtaSeed] = useState(0);
  const [ctaText, setCtaText] = useState(() =>
    createCtaText({ productDescription: INITIAL_HOOK_SOURCE, seed: 0, type: 'urgency' })
  );
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [selectedRewriteIndex, setSelectedRewriteIndex] = useState(0);

  // ─── Setup state ──────────────────────────────────────────────────────────
  const [provider, setProvider] = useState('remotion');
  const [providers, setProviders] = useState<ProviderDefinition[]>(
    () => initialProviders as ProviderDefinition[]
  );
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [bulkInput, setBulkInput] = useState(
    'Compact espresso machine\nVitamin C serum kit\nAI subtitle generator'
  );
  const [bulkJobs, setBulkJobs] = useState<BulkJobItem[]>([]);
  const [bulkErrorMessage, setBulkErrorMessage] = useState<string | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  // ─── Render state ──────────────────────────────────────────────────────────
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [autoMachineNotice, setAutoMachineNotice] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    () => initialCurrentUser as CurrentUser | null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshVideoState = useCallback(
    async (
      videoId: string,
      fallbackError = 'Failed to refresh video status.'
    ): Promise<VideoResponse | null> => {
      const latestVideo = await loadVideo(videoId, router, fallbackError);

      if (!latestVideo) {
        return null;
      }

      setVideo((currentVideo) => {
        if (!currentVideo || currentVideo.id !== latestVideo.id) {
          return currentVideo;
        }

        return latestVideo;
      });

      return latestVideo;
    },
    [router]
  );

  useEffect(() => {
    if (initialCurrentUser !== null) {
      setCurrentUser(initialCurrentUser);
    }
  }, [initialCurrentUser]);

  useEffect(() => {
    if (initialProviders.length > 0) {
      setProviders(initialProviders as ProviderDefinition[]);
    }
  }, [initialProviders]);

  // ─── Publish state ────────────────────────────────────────────────────────
  const [selectedExportFormatId, setSelectedExportFormatId] = useState<ExportFormatId>('tiktok-9x16');
  const [postingPreparation, setPostingPreparation] = useState<PostingPreparation>(() =>
    createPostingPreparation({
      prompt: INITIAL_PROMPT,
      selectedHookText: null,
      ctaText: createCtaText({ productDescription: INITIAL_HOOK_SOURCE, seed: 0, type: 'urgency' }),
    })
  );
  const [postingNotice, setPostingNotice] = useState<string | null>(null);
  const [hashtagSeed, setHashtagSeed] = useState(0);
  const [hashtagSuggestions, setHashtagSuggestions] = useState(() =>
    createHashtagSuggestionSet({ prompt: INITIAL_PROMPT, seed: 0 })
  );
  const [hashtagNotice, setHashtagNotice] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'editor'>('editor');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 'team-owner', email: 'owner@reevio.app', role: 'owner' },
  ]);
  const [teamNotice, setTeamNotice] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'logo'>('text');
  const [watermarkText, setWatermarkText] = useState('Reevio');
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('bottom-right');
  const [referralCode] = useState('REEVIO-START');
  const [referralCredits] = useState(30);
  const [views, setViews] = useState('12000');
  const [likes, setLikes] = useState('840');
  const [watchTime, setWatchTime] = useState('18');

  useEffect(() => {
    if (!video?.id) {
      return;
    }

    if (video.status === 'completed' || video.status === 'failed' || video.outputUrl) {
      return;
    }

    void refreshVideoState(video.id).catch(() => undefined);

    const pollTimer = window.setInterval(() => {
      void refreshVideoState(video.id).catch(() => undefined);
    }, 3000);

    return () => {
      window.clearInterval(pollTimer);
    };
  }, [video?.id, video?.outputUrl, video?.status, refreshVideoState]);

  // Use SSE for real-time events, with polling as a safety net in case an event is missed.
  useVideoEvents(
    {
      onVideoStep: (event) => {
        if (!video || video.id !== event.videoId) return;
        if (video.status === 'completed' || video.status === 'failed') return;
        void refreshVideoState(event.videoId).catch(() => undefined);
      },

      onVideoCompleted: (event) => {
        if (!video || video.id !== event.videoId) return;
        setVideo((currentVideo) => {
          if (!currentVideo || currentVideo.id !== event.videoId) {
            return currentVideo;
          }

          return {
            ...currentVideo,
            status: 'completed',
            outputUrl: event.outputUrl ?? currentVideo.outputUrl,
            previewUrl: event.previewUrl ?? currentVideo.previewUrl,
            errorCode: event.errorCode ?? null,
            errorMessage: event.errorMessage ?? null,
          };
        });
        void refreshVideoState(event.videoId).catch(() => undefined);
        void refreshCurrentUser(setCurrentUser).catch(() => undefined);
      },

      onVideoFailed: (event) => {
        if (!video || video.id !== event.videoId) return;
        setVideo((currentVideo) => {
          if (!currentVideo || currentVideo.id !== event.videoId) {
            return currentVideo;
          }

          return {
            ...currentVideo,
            status: 'failed',
            errorCode: event.errorCode ?? null,
            errorMessage: event.errorMessage ?? null,
          };
        });
        void refreshVideoState(event.videoId).catch(() => undefined);
        void refreshCurrentUser(setCurrentUser).catch(() => undefined);
      },
    },
    video?.id ?? null
  );

  // ─── Derived ──────────────────────────────────────────────────────────────
  const selectedHook = hookOptions.find((hookOption) => hookOption.id === selectedHookId) ?? null;

  const composedPrompt = buildPromptWithCreativeDirectives({
    prompt,
    selectedHookText: selectedHook?.text ?? null,
    ctaText,
  });

  const exportFormats = createExportFormats({ prompt, selectedHookText: selectedHook?.text ?? null, ctaText });

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

  const trendIdeas = createTrendIdeas(prompt);
  const videoTemplates = createVideoTemplates();

  const selectedProvider =
    providers.find((providerDefinition) => providerDefinition.name === provider) ?? null;

  const storageUrl =
    video?.outputUrl ??
    `https://cdn.reevio.app/secure/${provider}/${aspectRatio.replace(':', 'x')}/preview.mp4`;

  const hasEnoughCredits =
    currentUser !== null && selectedProvider !== null
      ? currentUser.credits >= selectedProvider.creditCost
      : false;

  const isLowCredit =
    currentUser !== null && selectedProvider !== null
      ? currentUser.credits < selectedProvider.creditCost * 2
      : false;

  const performanceInsight = createPerformanceInsight({ views, likes, watchTime });

  const studioSteps = [
    { id: 'brief' as const, eyebrow: 'Step 1', label: 'Brief', description: 'Prompt, hook, CTA, and creative direction.', status: prompt.trim().length > 0 ? 'Ready' : 'Start here' },
    { id: 'setup' as const, eyebrow: 'Step 2', label: 'Setup', description: 'Provider, aspect ratio, credits, and score.', status: selectedProvider ? 'Configured' : 'Pick provider' },
    { id: 'render' as const, eyebrow: 'Step 3', label: 'Render', description: 'Generate the video and monitor live progress.', status: video ? video.status : 'Waiting' },
    { id: 'publish' as const, eyebrow: 'Step 4', label: 'Publish', description: 'Export, posting, hashtags, and handoff.', status: video?.outputUrl ? 'Ready' : 'After render' },
  ];

  const activeStepIndex = studioSteps.findIndex((step) => step.id === activeStudioStep);
  const previousStep = studioSteps[activeStepIndex - 1]?.id ?? null;
  const nextStep = studioSteps[activeStepIndex + 1]?.id ?? null;

  const stepCompletion = {
    brief: prompt.trim().length > 0,
    setup: selectedProvider !== null && hasEnoughCredits,
    render: video !== null,
    publish: Boolean(video?.outputUrl),
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const onHookSourceChange = useCallback((value: string) => setHookSource(value), []);

  const onUseCurrentBrief = useCallback(() => setHookSource(prompt.trim() || INITIAL_HOOK_SOURCE), [prompt]);

  const onGenerateHooks = useCallback(() => {
    const normalized = hookSource.trim();
    if (!normalized) { setHookErrorMessage('Enter a product description before generating hooks.'); return; }
    const nextSeed = hookSeed + 1;
    setHookSeed(nextSeed);
    setHookOptions(createHookOptions({ productDescription: normalized, seed: nextSeed }));
    setSelectedHookId(null);
    setCopiedHookId(null);
    setHookErrorMessage(null);
  }, [hookSource, hookSeed]);

  const onCopyHook = useCallback((hook: HookOption) => {
    if (!navigator.clipboard) { setHookErrorMessage('Clipboard unavailable.'); return; }
    void navigator.clipboard.writeText(hook.text)
      .then(() => { setCopiedHookId(hook.id); setHookErrorMessage(null); })
      .catch(() => { setHookErrorMessage('Clipboard access failed.'); });
  }, []);

  const onSelectHook = useCallback((hookId: string) => setSelectedHookId(hookId), []);

  const onCtaTextChange = useCallback((value: string) => setCtaText(value), []);

  const onRegenerateCta = useCallback(() => {
    const nextSeed = ctaSeed + 1;
    setCtaSeed(nextSeed);
    setCtaText(createCtaText({ productDescription: hookSource, seed: nextSeed, type: ctaType }));
  }, [ctaSeed, hookSource, ctaType]);

  const onSelectCtaType = useCallback((type: CtaType) => {
    setCtaType(type);
    setCtaSeed(0);
    setCtaText(createCtaText({ productDescription: hookSource, seed: 0, type }));
  }, [hookSource]);

  const onPromptChange = useCallback((value: string) => setPrompt(value), []);

  const onSelectedRewriteIndexChange = useCallback((index: number) => setSelectedRewriteIndex(index), []);

  const onApplyRewriteVariation = useCallback(() => {
    const variation = rewriteVariations[selectedRewriteIndex];
    if (variation) setPrompt(variation);
  }, [rewriteVariations, selectedRewriteIndex]);

  const onProviderChange = useCallback((value: string) => setProvider(value), []);

  const onAspectRatioChange = useCallback((value: string) => setAspectRatio(value), []);

  const onBulkInputChange = useCallback((value: string) => setBulkInput(value), []);

  const onBulkFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    try {
      const fileContent = await uploadedFile.text();
      setBulkInput(fileContent);
      setBulkErrorMessage(null);
    } catch { setBulkErrorMessage('Failed to read the uploaded list.'); }
  }, []);

  const onGenerateBulk = useCallback(async () => {
    if (isBulkGenerating) return;
    const productDescriptions = parseBulkProductList(bulkInput);
    if (productDescriptions.length === 0) { setBulkErrorMessage('Add at least one product description.'); return; }

    const initialBulkJobs: BulkJobItem[] = productDescriptions.map((productDescription, index) => ({
      id: `bulk-${Date.now()}-${index + 1}`, productDescription, videoId: null,
      status: 'queued', outputUrl: null, errorMessage: null,
    }));

    setBulkJobs(initialBulkJobs);
    setBulkErrorMessage(null);
    setIsBulkGenerating(true);

    const settledJobs = await Promise.allSettled(
      initialBulkJobs.map(async (bulkJob) => {
        const result = await requestVideoGeneration({
          prompt: createBulkVideoPrompt(bulkJob.productDescription), provider, aspectRatio, router,
          fallbackError: `Failed to queue "${bulkJob.productDescription}".`,
        });
        return { id: bulkJob.id, videoId: result.video.id, status: toBulkJobStatus(result.video.status),
          outputUrl: result.video.outputUrl, errorMessage: result.video.errorMessage };
      })
    );

    setBulkJobs(previousJobs =>
      previousJobs.map((bulkJob, index) => {
        const settledJob = settledJobs[index];
        if (!settledJob || settledJob.status === 'rejected') {
          return { ...bulkJob, status: 'failed',
            errorMessage: settledJob?.reason instanceof Error ? settledJob.reason.message : 'Failed.' };
        }
        return { ...bulkJob, ...settledJob.value };
      })
    );
    setIsBulkGenerating(false);
    void refreshCurrentUser(setCurrentUser).catch(() => {
      setBulkErrorMessage('Bulk completed, but credits could not be refreshed.');
    });
  }, [isBulkGenerating, bulkInput, provider, aspectRatio, router]);

  const onRetryBulkJob = useCallback(async (bulkJobId: string) => {
    const bulkJob = bulkJobs.find(item => item.id === bulkJobId);
    if (!bulkJob) return;
    setBulkJobs(previousJobs =>
      previousJobs.map(item => item.id === bulkJobId ? { ...item, status: 'processing', errorMessage: null } : item)
    );
    try {
      const result = await requestVideoGeneration({
        prompt: createBulkVideoPrompt(bulkJob.productDescription), provider, aspectRatio, router,
        fallbackError: `Failed to retry "${bulkJob.productDescription}".`,
      });
      setBulkJobs(previousJobs =>
        previousJobs.map(item => item.id === bulkJobId ? { ...item,
          videoId: result.video.id, status: toBulkJobStatus(result.video.status),
          outputUrl: result.video.outputUrl, errorMessage: result.video.errorMessage } : item)
      );
      void refreshCurrentUser(setCurrentUser).catch(() => { setBulkErrorMessage('Retry succeeded, but credits not refreshed.'); });
    } catch (error: unknown) {
      setBulkJobs(previousJobs =>
        previousJobs.map(item => item.id === bulkJobId ? { ...item, status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Retry failed.' } : item)
      );
    }
  }, [bulkJobs, provider, aspectRatio, router]);

  const onRetryFailedBulkJobs = useCallback(() => {
    bulkJobs.filter(bulkJob => bulkJob.status === 'failed').forEach(bulkJob => { void onRetryBulkJob(bulkJob.id); });
  }, [bulkJobs, onRetryBulkJob]);

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsPending(true);
    try {
      await submitVideoRequest({
        promptToSend: composedPrompt, router, provider, aspectRatio,
        setVideo: setVideo as React.Dispatch<React.SetStateAction<VideoResponse | null>>,
        setCurrentUser: setCurrentUser as React.Dispatch<React.SetStateAction<CurrentUser | null>>,
        setErrorMessage,
      });
    } finally { setIsPending(false); }
  }, [composedPrompt, router, provider, aspectRatio]);

  const onRunAutoContentMachine = useCallback(() => {
    const autoHooks = createHookOptions({ productDescription: hookSource, seed: 0 });
    const autoHook = autoHooks[0] ?? null;
    const autoCtaText = createCtaText({ productDescription: hookSource, seed: 0, type: 'urgency' });
    const autoPrompt = hookSource.trim().length > 0
      ? `Create a ready-to-publish affiliate video for ${hookSource.trim()} with auto script, auto video, and auto voiceover.`
      : 'Create a ready-to-publish affiliate video with auto script, auto video, and auto voiceover.';

    setHookOptions(autoHooks);
    setSelectedHookId(autoHook?.id ?? null);
    setCtaText(autoCtaText);
    setPrompt(autoPrompt);
    setAutoMachineNotice('Auto pipeline prepared for 1-click generation.');

    setIsPending(true);
    void submitVideoRequest({
      promptToSend: buildPromptWithCreativeDirectives({ prompt: autoPrompt, selectedHookText: autoHook?.text ?? null, ctaText: autoCtaText }),
      router, provider, aspectRatio,
      setVideo: setVideo as React.Dispatch<React.SetStateAction<VideoResponse | null>>,
      setCurrentUser: setCurrentUser as React.Dispatch<React.SetStateAction<CurrentUser | null>>,
      setErrorMessage,
    }).finally(() => { setIsPending(false); });
  }, [hookSource, provider, aspectRatio, router]);

  const onCopyStorageUrl = useCallback(() => {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(storageUrl).catch(() => {});
  }, [storageUrl]);

  const onSelectExportFormat = useCallback((formatId: ExportFormatId) => setSelectedExportFormatId(formatId), []);

  const onDownloadFormat = useCallback((format: ReturnType<typeof createExportFormats>[number]) => {
    import('../page.helpers').then(({ createExportBrief, downloadTextFile }) => {
      const fileContent = createExportBrief({ format, prompt, selectedHookText: selectedHook?.text ?? null, ctaText });
      downloadTextFile({ content: fileContent, fileName: `${format.id}-export-brief.txt` });
    });
  }, [prompt, selectedHook, ctaText]);

  const onDownloadAllFormats = useCallback(() => {
    import('../page.helpers').then(({ createExportBrief, downloadTextFile }) => {
      const fileContent = exportFormats
        .map(format => createExportBrief({ format, prompt, selectedHookText: selectedHook?.text ?? null, ctaText }))
        .join('\n\n------------------------------\n\n');
      downloadTextFile({ content: fileContent, fileName: 'multi-format-export-brief.txt' });
    });
  }, [exportFormats, prompt, selectedHook, ctaText]);

  const onRegeneratePostingPreparation = useCallback(() => {
    setPostingPreparation(createPostingPreparation({ prompt, selectedHookText: selectedHook?.text ?? null, ctaText }));
    setPostingNotice(null);
  }, [prompt, selectedHook, ctaText]);

  const onCopyPostingField = useCallback((label: string, value: string) => {
    if (!navigator.clipboard) { setPostingNotice('Clipboard unavailable.'); return; }
    void navigator.clipboard.writeText(value)
      .then(() => { setPostingNotice(`${label} copied.`); })
      .catch(() => { setPostingNotice(`Failed to copy ${label.toLowerCase()}.`); });
  }, []);

  const onUpdatePostingPreparation = useCallback((field: keyof PostingPreparation, value: string) => {
    setPostingPreparation(prev => ({ ...prev, [field]: value }));
  }, []);

  const onApplyTemplate = useCallback((templatePrompt: string) => {
    setPrompt(templatePrompt);
    setHookSource(templatePrompt);
  }, []);

  const onRegenerateHashtags = useCallback(() => {
    const nextSeed = hashtagSeed + 1;
    setHashtagSeed(nextSeed);
    setHashtagSuggestions(createHashtagSuggestionSet({ prompt, seed: nextSeed }));
    setHashtagNotice(null);
  }, [hashtagSeed, prompt]);

  const onCopyHashtags = useCallback(() => {
    if (!navigator.clipboard) { setHashtagNotice('Clipboard unavailable.'); return; }
    void navigator.clipboard.writeText(hashtagSuggestions.combined)
      .then(() => { setHashtagNotice('Hashtag set copied.'); })
      .catch(() => { setHashtagNotice('Failed to copy hashtags.'); });
  }, [hashtagSuggestions]);

  const onUseHashtagsInPosting = useCallback(() => {
    setPostingPreparation(prev => ({ ...prev, hashtags: hashtagSuggestions.combined }));
    setHashtagNotice('Hashtag set moved into posting preparation.');
  }, [hashtagSuggestions]);

  const onInviteEmailChange = useCallback((value: string) => setInviteEmail(value), []);
  const onInviteRoleChange = useCallback((role: 'owner' | 'editor') => setInviteRole(role), []);

  const onInviteMember = useCallback(() => {
    const normalized = inviteEmail.trim();
    if (!normalized) { setTeamNotice('Enter an email before sending an invite.'); return; }
    setTeamMembers(prev => [...prev, { id: `team-${prev.length + 1}`, email: normalized, role: inviteRole }]);
    setInviteEmail('');
    setInviteRole('editor');
    setTeamNotice(`Invite prepared for ${normalized}.`);
  }, [inviteEmail, inviteRole]);

  const onWatermarkTypeChange = useCallback((type: 'text' | 'logo') => setWatermarkType(type), []);
  const onWatermarkTextChange = useCallback((value: string) => setWatermarkText(value), []);
  const onWatermarkPositionChange = useCallback((position: WatermarkPosition) => setWatermarkPosition(position), []);

  const onCopyReferralCode = useCallback(() => {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(referralCode).catch(() => {});
  }, [referralCode]);

  const onViewsChange = useCallback((value: string) => setViews(value), []);
  const onLikesChange = useCallback((value: string) => setLikes(value), []);
  const onWatchTimeChange = useCallback((value: string) => setWatchTime(value), []);

  const value = useMemo<CreateVideoContextValue>(() => ({
    activeStudioStep, setActiveStudioStep, activeStepIndex, previousStep, nextStep, stepCompletion,
    hookSource, onHookSourceChange, onUseCurrentBrief, hookSeed, onGenerateHooks, hookOptions, selectedHookId, onSelectHook,
    copiedHookId, onCopyHook, hookErrorMessage, ctaType, ctaSeed, ctaText, onCtaTextChange,
    onRegenerateCta, onSelectCtaType, prompt, onPromptChange, rewriteVariations, selectedRewriteIndex,
    onSelectedRewriteIndexChange, onApplyRewriteVariation, onApplyTemplate, trendIdeas, videoTemplates,
    providers: providers as readonly ProviderDefinition[], selectedProvider, provider, onProviderChange,
    aspectRatio, onAspectRatioChange, hasEnoughCredits, isLowCredit, bulkInput, onBulkInputChange,
    onBulkFileUpload, bulkJobs: bulkJobs as readonly BulkJobItem[], onGenerateBulk, isBulkGenerating,
    onRetryBulkJob, onRetryFailedBulkJobs, bulkErrorMessage, viralScoreAnalysis,
    currentUser: currentUser as CurrentUser | null,
    video: video as VideoResponse | null, isPending, autoMachineNotice, onSubmit, onRunAutoContentMachine,
    exportFormats, selectedExportFormatId, onSelectExportFormat, onDownloadFormat, onDownloadAllFormats,
    postingPreparation, onRegeneratePostingPreparation, onCopyPostingField, onUpdatePostingPreparation,
    postingNotice, hashtagSeed, hashtagSuggestions, onRegenerateHashtags, onCopyHashtags,
    onUseHashtagsInPosting, hashtagNotice,
    inviteEmail, onInviteEmailChange, inviteRole, onInviteRoleChange, onInviteMember,
    teamMembers: teamMembers as readonly TeamMember[], teamNotice,
    watermarkType, onWatermarkTypeChange, watermarkText, onWatermarkTextChange,
    watermarkPosition, onWatermarkPositionChange, referralCode, referralCredits, onCopyReferralCode,
    onCopyStorageUrl,
    views, onViewsChange, likes, onLikesChange, watchTime, onWatchTimeChange, performanceInsight,
    storageUrl, selectedHook: selectedHook as HookOption | null, composedPrompt, studioSteps,
  }), [
    activeStudioStep, activeStepIndex, previousStep, nextStep, hookSource, hookSeed, hookOptions,
    selectedHookId, copiedHookId, hookErrorMessage, ctaType, ctaSeed, ctaText, prompt, rewriteVariations,
    selectedRewriteIndex, trendIdeas, videoTemplates, providers, provider, aspectRatio, hasEnoughCredits,
    isLowCredit, bulkInput, bulkJobs, isBulkGenerating, bulkErrorMessage, viralScoreAnalysis, currentUser,
    video, isPending, autoMachineNotice, selectedExportFormatId, exportFormats, postingPreparation,
    postingNotice, hashtagSeed, hashtagSuggestions, hashtagNotice, inviteEmail, inviteRole, teamMembers,
    teamNotice, watermarkType, watermarkText, watermarkPosition, referralCode, referralCredits,
    views, likes, watchTime, performanceInsight, storageUrl, selectedHook, composedPrompt, studioSteps,
    stepCompletion, onHookSourceChange, onUseCurrentBrief, onGenerateHooks, onCopyHook, onSelectHook, onCtaTextChange,
    onRegenerateCta, onSelectCtaType, onPromptChange, onSelectedRewriteIndexChange, onApplyRewriteVariation,
    onProviderChange, onAspectRatioChange, onBulkInputChange, onBulkFileUpload, onGenerateBulk,
    onRetryBulkJob, onRetryFailedBulkJobs, onSubmit, onRunAutoContentMachine, onSelectExportFormat,
    onDownloadFormat, onDownloadAllFormats, onRegeneratePostingPreparation, onCopyPostingField,
    onUpdatePostingPreparation, onRegenerateHashtags, onCopyHashtags, onUseHashtagsInPosting,
    onInviteEmailChange, onInviteRoleChange, onInviteMember, onWatermarkTypeChange, onWatermarkTextChange,
    onWatermarkPositionChange, onCopyReferralCode, onCopyStorageUrl, onViewsChange, onLikesChange, onWatchTimeChange,
  ]);

  return <CreateVideoContext.Provider value={value}>{children}</CreateVideoContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCreateVideo(): CreateVideoContextValue {
  const ctx = useContext(CreateVideoContext);
  if (!ctx) throw new Error('useCreateVideo must be used within <CreateVideoProvider>');
  return ctx;
}
