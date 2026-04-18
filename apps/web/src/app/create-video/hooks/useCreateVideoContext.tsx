'use client';

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  buildPromptWithCreativeDirectives,
  createExportFormats,
  createPostingPreparation,
  createRewriteVariations,
  createTrendIdeas,
  createVideoTemplates,
  type ExportFormatId,
  type PostingPreparation,
  type TrendIdea,
  type VideoTemplateDefinition,
} from '../content-studio';
import { INITIAL_PROMPT } from '../page.constants';
import {
  loadVideo,
  loadVideoQueue,
  refreshCurrentUser,
  submitVideoRequest,
} from '../page.api';
import { createExportBrief, downloadTextFile } from '../page.helpers';
import { useVideoEvents } from '@/lib/use-video-events';
import type {
  AppRouter,
  CurrentUser,
  ProviderDefinition,
  VideoResponse,
} from '../page.types';

export type StudioStep = 'brief' | 'render' | 'export';

export interface CreateVideoContextValue {
  activeStudioStep: StudioStep;
  setActiveStudioStep: (step: StudioStep) => void;
  activeStepIndex: number;
  previousStep: StudioStep | null;
  nextStep: StudioStep | null;
  stepCompletion: Readonly<{ brief: boolean; render: boolean; export: boolean }>;
  prompt: string;
  onPromptChange: (value: string) => void;
  rewriteVariations: readonly string[];
  selectedRewriteIndex: number;
  onSelectedRewriteIndexChange: (index: number) => void;
  onApplyRewriteVariation: () => void;
  trendIdeas: readonly TrendIdea[];
  videoTemplates: readonly VideoTemplateDefinition[];
  onApplyTemplate: (templatePrompt: string) => void;
  providers: readonly ProviderDefinition[];
  selectedProvider: ProviderDefinition | null;
  provider: string;
  onProviderChange: (value: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  hasEnoughCredits: boolean;
  isLowCredit: boolean;
  currentUser: CurrentUser | null;
  video: VideoResponse | null;
  queueVideos: readonly VideoResponse[];
  isPending: boolean;
  quickGenerateNotice: string | null;
  errorMessage: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onRunQuickGenerate: () => void;
  onRefreshQueue: () => void;
  onSelectQueueVideo: (videoId: string) => void;
  exportFormats: ReturnType<typeof createExportFormats>;
  selectedExportFormatId: ExportFormatId;
  onSelectExportFormat: (formatId: ExportFormatId) => void;
  onDownloadFormat: (format: ReturnType<typeof createExportFormats>[number]) => void;
  onDownloadAllFormats: () => void;
  postingPreparation: PostingPreparation;
  onRegeneratePostingPreparation: () => void;
  onCopyPostingField: (label: string, value: string) => void;
  onUpdatePostingPreparation: (
    field: keyof PostingPreparation,
    value: string
  ) => void;
  postingNotice: string | null;
  outputUrl: string | null;
  onCopyOutputUrl: () => void;
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
  const initialCreatableProviders = getCreatableProviders(
    initialProviders as ProviderDefinition[]
  );

  const [activeStudioStep, setActiveStudioStep] = useState<StudioStep>('brief');
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [selectedRewriteIndex, setSelectedRewriteIndex] = useState(0);
  const [provider, setProvider] = useState(
    () => initialCreatableProviders[0]?.name ?? ''
  );
  const [providers, setProviders] = useState<ProviderDefinition[]>(
    () => initialCreatableProviders
  );
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [queueVideos, setQueueVideos] = useState<VideoResponse[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [quickGenerateNotice, setQuickGenerateNotice] = useState<string | null>(
    null
  );
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    () => initialCurrentUser as CurrentUser | null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedExportFormatId, setSelectedExportFormatId] =
    useState<ExportFormatId>('tiktok-9x16');
  const [postingPreparation, setPostingPreparation] =
    useState<PostingPreparation>(() =>
      createPostingPreparation({
        prompt: INITIAL_PROMPT,
      })
    );
  const [postingNotice, setPostingNotice] = useState<string | null>(null);

  const refreshQueue = useCallback(async (): Promise<VideoResponse[]> => {
    const videos = await loadVideoQueue(router, 'Failed to load the render queue.');

    if (!videos) {
      return [];
    }

    setQueueVideos(videos);

    return videos;
  }, [router]);

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
      setQueueVideos((currentQueue) =>
        currentQueue.map((queuedVideo) =>
          queuedVideo.id === latestVideo.id ? latestVideo : queuedVideo
        )
      );

      if (latestVideo.status === 'failed') {
        setErrorMessage(
          latestVideo.errorMessage ??
            'The render stopped before finishing. Please try again.'
        );
        setActiveStudioStep('render');
      } else if (latestVideo.status === 'completed') {
        setErrorMessage(null);
      }

      return latestVideo;
    },
    [router]
  );

  useEffect(() => {
    void refreshQueue().catch(() => undefined);
  }, [refreshQueue]);

  useEffect(() => {
    if (initialCurrentUser !== null) {
      setCurrentUser(initialCurrentUser);
    }
  }, [initialCurrentUser]);

  useEffect(() => {
    if (initialProviders.length > 0) {
      setProviders(getCreatableProviders(initialProviders as ProviderDefinition[]));
    }
  }, [initialProviders]);

  useEffect(() => {
    if (providers.length === 0) {
      return;
    }

    if (!providers.some((providerDefinition) => providerDefinition.name === provider)) {
      setProvider(providers[0]!.name);
    }
  }, [provider, providers]);

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

  useEffect(() => {
    const hasActiveQueueItem = queueVideos.some(
      (queuedVideo) =>
        queuedVideo.status === 'queued' || queuedVideo.status === 'processing'
    );

    if (!hasActiveQueueItem) {
      return;
    }

    const pollTimer = window.setInterval(() => {
      void refreshQueue().catch(() => undefined);
    }, 4000);

    return () => {
      window.clearInterval(pollTimer);
    };
  }, [queueVideos, refreshQueue]);

  useVideoEvents(
    {
      onVideoStep: (event) => {
        if (!video || video.id !== event.videoId) return;
        if (video.status === 'completed' || video.status === 'failed') return;
        setVideo((currentVideo) => {
          if (!currentVideo || currentVideo.id !== event.videoId) {
            return currentVideo;
          }

          return {
            ...currentVideo,
            status: 'processing',
            currentStep: event.step,
          };
        });
        void refreshVideoState(event.videoId).catch(() => undefined);
        void refreshQueue().catch(() => undefined);
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
            currentStep: 'saveResult',
            outputUrl: event.outputUrl ?? currentVideo.outputUrl,
            previewUrl: event.previewUrl ?? currentVideo.previewUrl,
            errorCode: event.errorCode ?? null,
            errorMessage: event.errorMessage ?? null,
          };
        });
        setErrorMessage(null);
        setActiveStudioStep('export');
        void refreshVideoState(event.videoId).catch(() => undefined);
        void refreshQueue().catch(() => undefined);
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
            currentStep: currentVideo.currentStep ?? null,
            errorCode: event.errorCode ?? null,
            errorMessage: event.errorMessage ?? null,
          };
        });
        setErrorMessage(
          event.errorMessage ??
            'The render stopped before finishing. Please try again.'
        );
        setActiveStudioStep('render');
        void refreshVideoState(event.videoId).catch(() => undefined);
        void refreshQueue().catch(() => undefined);
        void refreshCurrentUser(setCurrentUser).catch(() => undefined);
      },
    },
    video?.id ?? null
  );

  const composedPrompt = buildPromptWithCreativeDirectives({ prompt });

  const exportFormats = createExportFormats({ prompt });

  const rewriteVariations = createRewriteVariations({ prompt });

  const trendIdeas = createTrendIdeas(prompt);
  const videoTemplates = createVideoTemplates();

  const selectedProvider =
    providers.find((providerDefinition) => providerDefinition.name === provider) ??
    null;

  const outputUrl = video?.outputUrl ?? video?.previewUrl ?? null;

  const hasEnoughCredits =
    currentUser !== null && selectedProvider !== null
      ? currentUser.credits >= selectedProvider.creditCost
      : false;

  const isLowCredit =
    currentUser !== null && selectedProvider !== null
      ? currentUser.credits < selectedProvider.creditCost * 2
      : false;

  const studioSteps = [
    {
      id: 'brief' as const,
      eyebrow: 'Step 1',
      label: 'Brief',
      description: 'Prompt, rewrites, and templates.',
      status: prompt.trim().length > 0 ? 'Ready' : 'Start here',
    },
    {
      id: 'render' as const,
      eyebrow: 'Step 2',
      label: 'Render',
      description: 'Provider, aspect ratio, credits, and live progress.',
      status: video ? video.status : 'Waiting',
    },
    {
      id: 'export' as const,
      eyebrow: 'Step 3',
      label: 'Export',
      description: 'Output packaging, caption package, and format briefs.',
      status: outputUrl ? 'Ready' : 'After render',
    },
  ];

  const activeStepIndex = studioSteps.findIndex((step) => step.id === activeStudioStep);
  const previousStep = studioSteps[activeStepIndex - 1]?.id ?? null;
  const nextStep = studioSteps[activeStepIndex + 1]?.id ?? null;

  const stepCompletion = {
    brief: prompt.trim().length > 0,
    render: selectedProvider !== null && hasEnoughCredits,
    export: Boolean(outputUrl),
  };

  const onPromptChange = useCallback((value: string) => {
    setPrompt(value);
    setQuickGenerateNotice(null);
  }, []);

  const onSelectedRewriteIndexChange = useCallback((index: number) => {
    setSelectedRewriteIndex(index);
  }, []);

  const onApplyRewriteVariation = useCallback(() => {
    const variation = rewriteVariations[selectedRewriteIndex];
    if (variation) {
      setPrompt(variation);
    }
  }, [rewriteVariations, selectedRewriteIndex]);

  const onApplyTemplate = useCallback((templatePrompt: string) => {
    setPrompt(templatePrompt);
  }, []);

  const onProviderChange = useCallback((value: string) => setProvider(value), []);
  const onAspectRatioChange = useCallback((value: string) => setAspectRatio(value), []);

  const submitPrompt = useCallback(
    async (promptToSend: string) => {
      setErrorMessage(null);
      setActiveStudioStep('render');
      setIsPending(true);
      setVideo(null);

      try {
        await submitVideoRequest({
          promptToSend,
          router,
          provider,
          aspectRatio,
          setVideo: setVideo as Dispatch<SetStateAction<VideoResponse | null>>,
          setCurrentUser: setCurrentUser as Dispatch<SetStateAction<CurrentUser | null>>,
          setErrorMessage,
        });
        void refreshQueue().catch(() => undefined);
      } finally {
        setIsPending(false);
      }
    },
    [aspectRatio, provider, refreshQueue, router]
  );

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submitPrompt(composedPrompt);
    },
    [composedPrompt, submitPrompt]
  );

  const onRunQuickGenerate = useCallback(() => {
    const effectivePrompt = prompt.trim() || INITIAL_PROMPT;
    const promptToSend = buildPromptWithCreativeDirectives({
      prompt: effectivePrompt,
    });

    setPrompt(effectivePrompt);
    setQuickGenerateNotice('Quick generate queued for the current short-form brief.');

    void submitPrompt(promptToSend);
  }, [prompt, submitPrompt]);

  const onRefreshQueue = useCallback(() => {
    void refreshQueue().catch(() => undefined);
  }, [refreshQueue]);

  const onSelectQueueVideo = useCallback(
    (videoId: string) => {
      const selectedVideo = queueVideos.find((queuedVideo) => queuedVideo.id === videoId);

      if (!selectedVideo) {
        return;
      }

      setVideo(selectedVideo);

      if (selectedVideo.status === 'completed') {
        setErrorMessage(null);
        setActiveStudioStep('export');
      } else {
        setActiveStudioStep('render');
        setErrorMessage(
          selectedVideo.status === 'failed'
            ? selectedVideo.errorMessage ??
                'The render stopped before finishing. Please try again.'
            : null
        );
      }

      void refreshVideoState(selectedVideo.id).catch(() => undefined);
    },
    [queueVideos, refreshVideoState]
  );

  const onSelectExportFormat = useCallback((formatId: ExportFormatId) => {
    setSelectedExportFormatId(formatId);
  }, []);

  const onDownloadFormat = useCallback(
    (format: ReturnType<typeof createExportFormats>[number]) => {
      const fileContent = createExportBrief({
        format,
        prompt,
      });

      downloadTextFile({
        content: fileContent,
        fileName: `${format.id}-export-brief.txt`,
      });
    },
    [prompt]
  );

  const onDownloadAllFormats = useCallback(() => {
    const fileContent = exportFormats
      .map((format) =>
        createExportBrief({
          format,
          prompt,
        })
      )
      .join('\n\n------------------------------\n\n');

    downloadTextFile({
      content: fileContent,
      fileName: 'short-form-export-briefs.txt',
    });
  }, [exportFormats, prompt]);

  const onRegeneratePostingPreparation = useCallback(() => {
    setPostingPreparation(
      createPostingPreparation({
        prompt,
      })
    );
    setPostingNotice(null);
  }, [prompt]);

  const onCopyPostingField = useCallback((label: string, value: string) => {
    if (!navigator.clipboard) {
      setPostingNotice('Clipboard unavailable.');
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
  }, []);

  const onUpdatePostingPreparation = useCallback(
    (field: keyof PostingPreparation, value: string) => {
      setPostingPreparation((previousValue) => ({
        ...previousValue,
        [field]: value,
      }));
    },
    []
  );

  const onCopyOutputUrl = useCallback(() => {
    if (!navigator.clipboard || !outputUrl) {
      return;
    }

    void navigator.clipboard.writeText(outputUrl).catch(() => undefined);
  }, [outputUrl]);

  const value = useMemo<CreateVideoContextValue>(
    () => ({
      activeStudioStep,
      setActiveStudioStep,
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
      providers: providers as readonly ProviderDefinition[],
      selectedProvider,
      provider,
      onProviderChange,
      aspectRatio,
      onAspectRatioChange,
      hasEnoughCredits,
      isLowCredit,
      currentUser: currentUser as CurrentUser | null,
      video: video as VideoResponse | null,
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
      composedPrompt,
      studioSteps,
    }),
    [
      activeStudioStep,
      activeStepIndex,
      previousStep,
      nextStep,
      stepCompletion,
      prompt,
      rewriteVariations,
      selectedRewriteIndex,
      trendIdeas,
      videoTemplates,
      providers,
      selectedProvider,
      provider,
      aspectRatio,
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
      postingPreparation,
      postingNotice,
      outputUrl,
      composedPrompt,
      studioSteps,
      onPromptChange,
      onSelectedRewriteIndexChange,
      onApplyRewriteVariation,
      onApplyTemplate,
      onProviderChange,
      onAspectRatioChange,
      onSelectExportFormat,
      onDownloadFormat,
      onDownloadAllFormats,
      onRegeneratePostingPreparation,
      onCopyPostingField,
      onUpdatePostingPreparation,
      onCopyOutputUrl,
    ]
  );

  return (
    <CreateVideoContext.Provider value={value}>
      {children}
    </CreateVideoContext.Provider>
  );
}

export function useCreateVideo(): CreateVideoContextValue {
  const ctx = useContext(CreateVideoContext);

  if (!ctx) {
    throw new Error('useCreateVideo must be used within <CreateVideoProvider>');
  }

  return ctx;
}

function getCreatableProviders(
  providers: readonly ProviderDefinition[]
): ProviderDefinition[] {
  return providers.filter(
    (providerDefinition) =>
      providerDefinition.priceTier === 'free' &&
      providerDefinition.status !== 'disabled'
  );
}
