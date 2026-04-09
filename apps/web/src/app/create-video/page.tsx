'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDeferredValue, useEffect, useState, useTransition } from 'react';
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

export default function CreateVideoPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState(
    'Create an affiliate video for a compact espresso machine with strong hook and CTA.'
  );
  const [provider, setProvider] = useState('remotion');
  const [providers, setProviders] = useState<ProviderDefinition[]>([]);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const deferredPrompt = useDeferredValue(prompt);
  const selectedProvider =
    providers.find((providerDefinition) => providerDefinition.name === provider) ?? null;
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
          prompt,
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
                  <p className={styles.previewPrompt}>{video?.prompt ?? deferredPrompt}</p>
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
