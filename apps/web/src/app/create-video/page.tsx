'use client';

import { useDeferredValue, useEffect, useEffectEvent, useState, useTransition } from 'react';
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

interface ApiEnvelope<T> {
  readonly success: boolean;
  readonly data: T;
  readonly error: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function CreateVideoPage() {
  const [prompt, setPrompt] = useState(
    'Create an affiliate video for a compact espresso machine with strong hook and CTA.'
  );
  const [provider, setProvider] = useState('veo');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredPrompt = useDeferredValue(prompt);

  const refreshVideo = useEffectEvent(async (videoId: string) => {
    const response = await fetch(`${API_URL}/video/${videoId}`, {
      cache: 'no-store',
    });
    const payload = (await response.json()) as ApiEnvelope<VideoResponse>;

    if (!response.ok) {
      throw new Error(payload.error ?? 'Failed to refresh video.');
    }

    setVideo(payload.data);
  });

  useEffect(() => {
    if (!video?.id) {
      return;
    }

    if (video.status === 'completed' || video.status === 'failed') {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshVideo(video.id).catch((error: unknown) => {
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
  }, [refreshVideo, video?.id, video?.status]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch(`${API_URL}/generate-video`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: 'demo@reevio.app',
          prompt,
          provider,
          aspectRatio,
        }),
      });

      const payload = (await response.json()) as ApiEnvelope<VideoResponse>;

      if (!response.ok) {
        setErrorMessage(payload.error ?? 'Failed to generate video.');
        return;
      }

      setVideo(payload.data);
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Create Video</p>
          <h1 className={styles.title}>Turn one affiliate brief into a ready-to-render video flow.</h1>
          <p className={styles.subtitle}>
            Reevio writes the script, builds scenes, picks images, adds voice and subtitles, then
            routes the render through your selected provider chain.
          </p>
        </header>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Prompt Studio</h2>
            <p className={styles.cardText}>
              This page uses the shared demo workspace user `demo@reevio.app`.
            </p>

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
                  >
                    <option value="veo">Veo</option>
                    <option value="topview">Topview</option>
                    <option value="grok">Grok</option>
                    <option value="flow">Google Flow</option>
                    <option value="remotion">Remotion</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="aspectRatio">
                    Aspect Ratio
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

              <button className={styles.submit} disabled={isPending} type="submit">
                {isPending ? 'Generating...' : 'Generate video'}
              </button>
            </form>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Preview</h2>
            <p className={styles.cardText}>Live status from the API route with worker-backed updates.</p>

            <div className={styles.previewCanvas}>
              <div className={styles.meta}>
                <span className={styles.pill}>{provider}</span>
                <span className={styles.pill}>{aspectRatio}</span>
                {video?.status ? <span className={styles.pill}>{video.status}</span> : null}
              </div>

              <div>
                <h3 className={styles.previewHeadline}>{video?.title ?? 'Prompt preview'}</h3>
                <p className={styles.previewPrompt}>{video?.prompt ?? deferredPrompt}</p>
              </div>

              <div className={styles.statusGrid}>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Video ID</span>
                  <span className={styles.statusValue}>{video?.id ?? 'Waiting for first request'}</span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Output URL</span>
                  <span className={styles.statusValue}>{video?.outputUrl ?? 'Rendering pipeline not started yet'}</span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Voiceover</span>
                  <span className={styles.statusValue}>{video?.voiceoverUrl ?? 'Will appear after orchestration'}</span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Subtitles</span>
                  <span className={styles.statusValue}>{video?.subtitlesUrl ?? 'Will appear after orchestration'}</span>
                </div>
              </div>

              {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
              {video?.errorMessage ? <p className={styles.error}>{video.errorMessage}</p> : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
