import { useEffect, useRef, useCallback } from 'react';

export interface VideoStepEvent {
  readonly videoId: string;
  readonly step: string;
}

export interface VideoCompletedEvent {
  readonly videoId: string;
  readonly status: string;
  readonly outputUrl: string | null;
  readonly previewUrl: string | null;
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
}

export interface VideoFailedEvent {
  readonly videoId: string;
  readonly status: string;
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
}

export interface VideoEventHandlers {
  readonly onVideoStep?: (event: VideoStepEvent) => void;
  readonly onVideoCompleted?: (event: VideoCompletedEvent) => void;
  readonly onVideoFailed?: (event: VideoFailedEvent) => void;
  readonly onError?: (error: Error) => void;
}

export function useVideoEvents(
  handlers: VideoEventHandlers,
  activeVideoId: string | null
): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // Stable per-event tracking — avoids stale closure inside SSE message handler
  const activeVideoIdRef = useRef<string | null>(null);
  activeVideoIdRef.current = activeVideoId;

  useEffect(() => {
    if (!activeVideoId) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;

      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      };

      eventSource.addEventListener('video.step', (e: MessageEvent) => {
        const currentVideoId = activeVideoIdRef.current;
        if (!currentVideoId) return;
        try {
          const data = JSON.parse(e.data) as VideoStepEvent;
          if (data.videoId !== currentVideoId) return;
          handlersRef.current.onVideoStep?.(data);
        } catch {
          // ignore malformed event data
        }
      });

      eventSource.addEventListener('video.completed', (e: MessageEvent) => {
        const currentVideoId = activeVideoIdRef.current;
        if (!currentVideoId) return;
        try {
          const data = JSON.parse(e.data) as VideoCompletedEvent;
          if (data.videoId !== currentVideoId) return;
          handlersRef.current.onVideoCompleted?.(data);
        } catch {
          // ignore malformed event data
        }
      });

      eventSource.addEventListener('video.failed', (e: MessageEvent) => {
        const currentVideoId = activeVideoIdRef.current;
        if (!currentVideoId) return;
        try {
          const data = JSON.parse(e.data) as VideoFailedEvent;
          if (data.videoId !== currentVideoId) return;
          handlersRef.current.onVideoFailed?.(data);
        } catch {
          // ignore malformed event data
        }
      });

      eventSource.addEventListener('error', () => {
        if (closed) return;
        handlersRef.current.onError?.(new Error('SSE connection error'));
      });

      eventSource.onerror = () => {
        if (closed) return;
        eventSource?.close();
        eventSource = null;
        reconnectTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, [activeVideoId]);
}
