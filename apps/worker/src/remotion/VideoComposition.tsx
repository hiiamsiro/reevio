import React from 'react';
import { Audio } from '@remotion/media';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
} from 'remotion';
import type { BuiltScene } from '@reevio/types';
import type { RemotionVideoProps } from './remotion.types';

export const FPS = 30;

export function VideoComposition(props: RemotionVideoProps) {
  const sceneDurationsInFrames = getSceneDurationsInFrames(
    props.builtScenes,
    props.durationInSeconds
  );

  return (
    <AbsoluteFill style={styles.container}>
      <Audio src={props.voiceoverUrl} />
      {props.builtScenes.map((scene, index) => {
        const from = sceneDurationsInFrames
          .slice(0, index)
          .reduce((total, durationInFrames) => total + durationInFrames, 0);
        const sceneDurationInFrames = sceneDurationsInFrames[index] ?? 1;

        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={sceneDurationInFrames}
          >
            <SceneCard
              scene={scene}
              sceneDurationInFrames={sceneDurationInFrames}
              sceneIndex={index}
              totalScenes={props.builtScenes.length}
            />
          </Sequence>
        );
      })}
      <AbsoluteFill style={styles.globalTexture} />
    </AbsoluteFill>
  );
}

function SceneCard(input: {
  readonly scene: BuiltScene;
  readonly sceneDurationInFrames: number;
  readonly sceneIndex: number;
  readonly totalScenes: number;
}) {
  const frame = useCurrentFrame();
  const presentation = getScenePresentation(
    input.scene.visualPrompt,
    input.sceneIndex
  );
  const sceneEnter = spring({
    fps: FPS,
    frame,
    config: {
      damping: presentation.motion === 'aggressive' ? 14 : 18,
      stiffness: 90,
    },
  });
  const sceneExit = interpolate(
    frame,
    [Math.max(0, input.sceneDurationInFrames - 12), input.sceneDurationInFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const imageEntrance = spring({
    fps: FPS,
    frame,
    config: {
      damping: presentation.motion === 'aggressive' ? 12 : 16,
      stiffness: presentation.motion === 'aggressive' ? 110 : 80,
    },
  });
  const textEntrance = spring({
    fps: FPS,
    frame: Math.max(0, frame - 4),
    config: {
      damping: 15,
      stiffness: 90,
    },
  });
  const sceneOpacity = interpolate(sceneEnter, [0, 1], [0.58, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sceneScale = interpolate(sceneExit, [0, 1], [1, 1.035], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sceneLift = interpolate(sceneEnter, [0, 1], [38, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const imageScale = interpolate(
    imageEntrance,
    [0, 1],
    [presentation.motion === 'aggressive' ? 1.16 : 1.09, 1.01],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const imageTranslateX = interpolate(
    frame,
    [0, input.sceneDurationInFrames],
    getImageTranslateRange(presentation.motion, input.sceneIndex, 'x'),
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const imageTranslateY = interpolate(
    frame,
    [0, input.sceneDurationInFrames],
    getImageTranslateRange(presentation.motion, input.sceneIndex, 'y'),
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const imageRotate = interpolate(
    frame,
    [0, input.sceneDurationInFrames],
    [presentation.motion === 'aggressive' ? -1.8 : -0.8, 0.8],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const textOpacity = interpolate(textEntrance, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textTranslateY = interpolate(textEntrance, [0, 1], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const accentProgress = interpolate(
    frame,
    [0, input.sceneDurationInFrames],
    [0.22, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const orbTravel = interpolate(
    frame,
    [0, input.sceneDurationInFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const sceneOutroOpacity = interpolate(sceneExit, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        ...styles.scene,
        opacity: sceneOpacity,
        transform: `translate3d(0, ${sceneLift}px, 0) scale(${sceneScale})`,
      }}
    >
      {renderSceneVisualLayer({
        accentProgress,
        imageRotate,
        imageScale,
        imageTranslateX,
        imageTranslateY,
        orbTravel,
        presentation,
        scene: input.scene,
        sceneDurationInFrames: input.sceneDurationInFrames,
      })}
      <div
        style={{
          ...styles.ambientOrb,
          background: `radial-gradient(circle, ${presentation.accentColor}66 0%, transparent 72%)`,
          left: -120 + orbTravel * 110,
          top: 120 - orbTravel * 40,
        }}
      />
      <div
        style={{
          ...styles.ambientOrbSecondary,
          background: `radial-gradient(circle, ${presentation.accentColor}40 0%, transparent 74%)`,
          right: -80 + orbTravel * 70,
          bottom: 40 + orbTravel * 60,
        }}
      />
      <div style={createSceneGradient(presentation)} />
      <div style={styles.imageTexture} />
      <div
        style={{
          ...styles.frameLine,
          borderColor: `${presentation.accentColor}55`,
        }}
      />
      <div
        style={{
          ...styles.accentBeam,
          background: `linear-gradient(90deg, ${presentation.accentColor}, transparent)`,
          transform: `scaleX(${accentProgress})`,
          transformOrigin: 'left center',
        }}
      />
      <div
        style={{
          ...styles.sceneExitVeil,
          opacity: sceneOutroOpacity,
          background: `linear-gradient(180deg, transparent 0%, ${presentation.backgroundBottom} 100%)`,
        }}
      />
      {renderSceneCopy({
        narration: input.scene.narration,
        headline: input.scene.headline,
        presentation,
        sceneIndex: input.sceneIndex,
        textOpacity,
        textTranslateY,
        totalScenes: input.totalScenes,
      })}
    </AbsoluteFill>
  );
}

function renderSceneVisualLayer(input: {
  readonly accentProgress: number;
  readonly imageRotate: number;
  readonly imageScale: number;
  readonly imageTranslateX: number;
  readonly imageTranslateY: number;
  readonly orbTravel: number;
  readonly presentation: ScenePresentation;
  readonly scene: BuiltScene;
  readonly sceneDurationInFrames: number;
}) {
  if (input.presentation.renderMode === 'motion-only') {
    return (
      <>
        <div style={styles.motionBase} />
        <div
          style={{
            ...styles.motionGrid,
            transform: `translate3d(0, ${-18 + input.orbTravel * 20}px, 0)`,
          }}
        />
        <div
          style={{
            ...styles.motionHeroCard,
            borderColor: `${input.presentation.accentColor}52`,
            transform: `translate3d(${input.imageTranslateX * 0.32}px, ${input.imageTranslateY * 0.28}px, 0) scale(${1 + (input.imageScale - 1) * 0.75}) rotate(${input.imageRotate * 0.18}deg)`,
          }}
        >
          <div style={styles.motionHeroHeader}>
            <span
              style={{
                ...styles.motionPill,
                backgroundColor: `${input.presentation.accentColor}20`,
                borderColor: `${input.presentation.accentColor}44`,
              }}
            >
              LIVE UPDATE
            </span>
            <span style={styles.motionMetaText}>AI / TECH / NOW</span>
          </div>
          <div style={styles.motionHeadline}>{input.scene.headline}</div>
          <div style={styles.motionBarTrack}>
            <div
              style={{
                ...styles.motionBarFill,
                background: `linear-gradient(90deg, ${input.presentation.accentColor}, rgba(255,255,255,0.9))`,
                transform: `scaleX(${input.accentProgress})`,
              }}
            />
          </div>
        </div>
        <div
          style={{
            ...styles.motionSideCard,
            borderColor: `${input.presentation.accentColor}44`,
            transform: `translate3d(${22 - input.orbTravel * 18}px, 0, 0)`,
          }}
        >
          <span style={styles.motionLabel}>Signal</span>
          <div style={styles.motionBars}>
            {[0.4, 0.68, 0.9, 0.58].map((heightScale, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={`bar-${index}`}
                style={{
                  ...styles.motionBar,
                  background:
                    index % 2 === 0
                      ? `${input.presentation.accentColor}`
                      : 'rgba(255,255,255,0.72)',
                  height: `${58 + heightScale * 120}px`,
                  transform: `scaleY(${0.88 + input.accentProgress * 0.12})`,
                }}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <Img
      src={input.scene.assetUrl}
      style={{
        ...styles.image,
        transform: `translate3d(${input.imageTranslateX}px, ${input.imageTranslateY}px, 0) scale(${input.imageScale}) rotate(${input.imageRotate}deg)`,
      }}
    />
  );
}

function renderSceneCopy(input: {
  readonly headline: string;
  readonly narration: string;
  readonly presentation: ScenePresentation;
  readonly sceneIndex: number;
  readonly textOpacity: number;
  readonly textTranslateY: number;
  readonly totalScenes: number;
}) {
  const sharedShellStyle: React.CSSProperties = {
    opacity: input.textOpacity,
    transform: `translate3d(0, ${input.textTranslateY}px, 0)`,
  };
  const metaText = `Scene ${input.sceneIndex + 1} / ${input.totalScenes}`;

  if (input.presentation.renderMode === 'motion-only') {
    return (
      <AbsoluteFill style={styles.motionCopyShell}>
        <div style={{ ...styles.motionCopyTopMeta, ...sharedShellStyle }}>
          <span style={styles.metaKicker}>AI NEWS FORMAT</span>
          <span
            style={{
              ...styles.infoChip,
              backgroundColor: `${input.presentation.accentColor}20`,
            }}
          >
            {metaText}
          </span>
        </div>
      </AbsoluteFill>
    );
  }

  switch (input.presentation.layout) {
    case 'centered-poster':
      return (
        <AbsoluteFill style={styles.posterShell}>
          <div
            style={{
              ...styles.posterCard,
              ...sharedShellStyle,
              borderColor: `${input.presentation.accentColor}40`,
            }}
          >
            <span
              style={{
                ...styles.infoChip,
                backgroundColor: `${input.presentation.accentColor}22`,
              }}
            >
              {metaText}
            </span>
            <h2 style={styles.posterHeadline}>{input.headline}</h2>
            <p style={styles.posterNarration}>{input.narration}</p>
          </div>
        </AbsoluteFill>
      );
    case 'split-composition':
      return (
        <AbsoluteFill style={styles.splitShell}>
          <div
            style={{
              ...styles.splitCard,
              ...sharedShellStyle,
              borderColor: `${input.presentation.accentColor}44`,
            }}
          >
            <span style={styles.metaKicker}>AUTO DIRECTED</span>
            <h2 style={styles.splitHeadline}>{input.headline}</h2>
            <p style={styles.splitNarration}>{input.narration}</p>
            <span
              style={{
                ...styles.infoChip,
                backgroundColor: `${input.presentation.accentColor}20`,
              }}
            >
              {metaText}
            </span>
          </div>
        </AbsoluteFill>
      );
    case 'editorial-top':
      return (
        <AbsoluteFill style={styles.editorialShell}>
          <div style={{ ...styles.editorialTop, ...sharedShellStyle }}>
            <span style={styles.metaKicker}>REEVIO FRAME</span>
            <h2 style={styles.editorialHeadline}>{input.headline}</h2>
          </div>
          <div
            style={{
              ...styles.editorialNote,
              borderColor: `${input.presentation.accentColor}44`,
              opacity: input.textOpacity,
            }}
          >
            <p style={styles.editorialNarration}>{input.narration}</p>
            <span
              style={{
                ...styles.infoChip,
                backgroundColor: `${input.presentation.accentColor}20`,
              }}
            >
              {metaText}
            </span>
          </div>
        </AbsoluteFill>
      );
    case 'hero-product-focus':
    default:
      return (
        <AbsoluteFill style={styles.focusShell}>
          <div style={{ ...styles.focusTopMeta, ...sharedShellStyle }}>
            <span style={styles.metaKicker}>PREMIUM CUT</span>
            <span
              style={{
                ...styles.infoChip,
                backgroundColor: `${input.presentation.accentColor}20`,
              }}
            >
              {metaText}
            </span>
          </div>
          <div
            style={{
              ...styles.focusCard,
              ...sharedShellStyle,
              borderColor: `${input.presentation.accentColor}44`,
            }}
          >
            <h2 style={styles.focusHeadline}>{input.headline}</h2>
            <p style={styles.focusNarration}>{input.narration}</p>
          </div>
        </AbsoluteFill>
      );
  }
}

function getSceneDurationsInFrames(
  scenes: readonly BuiltScene[],
  durationInSeconds: number
): number[] {
  const totalFrames = Math.max(1, Math.round(durationInSeconds * FPS));
  const originalFrames = scenes.map((scene) =>
    Math.max(1, Math.round(scene.durationInSeconds * FPS))
  );
  const originalTotal = originalFrames.reduce((total, value) => total + value, 0);

  if (originalTotal <= 0) {
    return [totalFrames];
  }

  const scaledFrames = originalFrames.map((frameCount) =>
    Math.max(1, Math.round((frameCount / originalTotal) * totalFrames))
  );
  const scaledTotal = scaledFrames.reduce((total, value) => total + value, 0);

  if (scaledTotal === totalFrames) {
    return scaledFrames;
  }

  const lastIndex = scaledFrames.length - 1;
  scaledFrames[lastIndex] = Math.max(
    1,
    scaledFrames[lastIndex]! + (totalFrames - scaledTotal)
  );
  return scaledFrames;
}

interface ScenePresentation {
  readonly accentColor: string;
  readonly backgroundBottom: string;
  readonly backgroundTop: string;
  readonly layout:
    | 'centered-poster'
    | 'editorial-top'
    | 'hero-product-focus'
    | 'split-composition';
  readonly motion: 'aggressive' | 'dynamic' | 'measured';
  readonly renderMode: 'image-led' | 'motion-only';
}

function getScenePresentation(
  visualPrompt: string,
  sceneIndex: number
): ScenePresentation {
  const normalizedPrompt = visualPrompt.toLowerCase();

  const layout = normalizedPrompt.includes('split composition')
    ? 'split-composition'
    : normalizedPrompt.includes('centered poster')
      ? 'centered-poster'
      : normalizedPrompt.includes('editorial portrait')
        ? 'editorial-top'
        : 'hero-product-focus';

  const motion = normalizedPrompt.includes('flash transitions') ||
    normalizedPrompt.includes('fast cuts')
    ? 'aggressive'
    : normalizedPrompt.includes('graceful camera drift') ||
        normalizedPrompt.includes('slow parallax')
      ? 'measured'
      : 'dynamic';
  const renderMode = normalizedPrompt.includes('full animation motion graphics') ||
    normalizedPrompt.includes('avoid stock-photo look') ||
    normalizedPrompt.includes('motion-design')
    ? 'motion-only'
    : 'image-led';

  if (
    normalizedPrompt.includes('champagne') ||
    normalizedPrompt.includes('luminous glow')
  ) {
    return {
      layout,
      motion,
      renderMode,
      accentColor: '#f1cf95',
      backgroundTop: 'rgba(255, 235, 208, 0.10)',
      backgroundBottom: 'rgba(16, 11, 10, 0.92)',
    };
  }

  if (
    normalizedPrompt.includes('electric accents') ||
    normalizedPrompt.includes('interface glow')
  ) {
    return {
      layout,
      motion,
      renderMode,
      accentColor: '#7bd4ff',
      backgroundTop: 'rgba(49, 96, 147, 0.16)',
      backgroundBottom: 'rgba(5, 10, 18, 0.94)',
    };
  }

  if (
    normalizedPrompt.includes('metallic accents') ||
    normalizedPrompt.includes('glossy highlights')
  ) {
    return {
      layout,
      motion,
      renderMode,
      accentColor: '#ffd36d',
      backgroundTop: 'rgba(126, 79, 22, 0.18)',
      backgroundBottom: 'rgba(10, 8, 8, 0.94)',
    };
  }

  return {
    layout,
    motion,
    renderMode,
    accentColor: sceneIndex % 2 === 0 ? '#c79a3b' : '#f0d9a0',
    backgroundTop: 'rgba(255, 214, 141, 0.10)',
    backgroundBottom: 'rgba(8, 8, 10, 0.94)',
  };
}

function createSceneGradient(
  presentation: ScenePresentation
): React.CSSProperties {
  return {
    ...styles.gradient,
    background: `linear-gradient(180deg, ${presentation.backgroundTop} 0%, rgba(7,7,9,0.36) 45%, ${presentation.backgroundBottom} 100%)`,
  };
}

function getImageTranslateRange(
  motion: ScenePresentation['motion'],
  sceneIndex: number,
  axis: 'x' | 'y'
): [number, number] {
  if (axis === 'x') {
    if (motion === 'aggressive') {
      return sceneIndex % 2 === 0 ? [80, -46] : [-80, 46];
    }

    if (motion === 'measured') {
      return sceneIndex % 2 === 0 ? [26, -12] : [-26, 12];
    }

    return sceneIndex % 2 === 0 ? [44, -24] : [-44, 24];
  }

  if (motion === 'aggressive') {
    return [28, -18];
  }

  if (motion === 'measured') {
    return [14, -8];
  }

  return [22, -12];
}

const styles = {
  container: {
    backgroundColor: '#050506',
    fontFamily: 'Arial, sans-serif',
  },
  globalTexture: {
    background:
      'radial-gradient(circle at top, rgba(255,255,255,0.08) 0%, transparent 34%), radial-gradient(circle at bottom, rgba(199,154,59,0.08) 0%, transparent 30%)',
    mixBlendMode: 'screen',
    opacity: 0.48,
  },
  scene: {
    overflow: 'hidden',
  },
  ambientOrb: {
    borderRadius: 9999,
    filter: 'blur(12px)',
    height: 380,
    position: 'absolute',
    width: 380,
  },
  ambientOrbSecondary: {
    borderRadius: 9999,
    filter: 'blur(18px)',
    height: 300,
    position: 'absolute',
    width: 300,
  },
  motionBase: {
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.02), transparent 24%), linear-gradient(180deg, rgba(4,8,18,0.72), rgba(4,8,18,0.2))',
    inset: 0,
    position: 'absolute',
  },
  motionGrid: {
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
    backgroundSize: '92px 92px',
    inset: '-10%',
    maskImage: 'radial-gradient(circle at center, black 48%, transparent 88%)',
    opacity: 0.18,
    position: 'absolute',
  },
  motionHeroCard: {
    backdropFilter: 'blur(18px)',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), rgba(8, 18, 42, 0.46)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 38,
    display: 'grid',
    gap: 22,
    left: 68,
    maxWidth: 700,
    padding: '30px 32px 34px',
    position: 'absolute',
    top: 144,
  },
  motionHeroHeader: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  motionPill: {
    alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 999,
    color: '#f7f1e4',
    display: 'inline-flex',
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 1.5,
    minHeight: 42,
    padding: '0 16px',
  },
  motionMetaText: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 3,
  },
  motionHeadline: {
    color: '#f6fbff',
    fontSize: 102,
    fontWeight: 900,
    letterSpacing: -2.2,
    lineHeight: 0.95,
    textTransform: 'uppercase',
  },
  motionBarTrack: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  motionBarFill: {
    borderRadius: 999,
    height: '100%',
    transformOrigin: 'left center',
    width: '100%',
  },
  motionSideCard: {
    backdropFilter: 'blur(14px)',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015)), rgba(8, 18, 42, 0.38)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 30,
    display: 'grid',
    gap: 16,
    padding: '22px 22px 24px',
    position: 'absolute',
    right: 68,
    top: 190,
    width: 220,
  },
  motionLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  motionBars: {
    alignItems: 'end',
    display: 'flex',
    gap: 14,
    height: 190,
  },
  motionBar: {
    borderRadius: 999,
    display: 'block',
    transformOrigin: 'bottom center',
    width: 24,
  },
  motionCopyShell: {
    justifyContent: 'space-between',
    padding: '68px 64px 72px',
  },
  motionCopyTopMeta: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  image: {
    height: '100%',
    objectFit: 'cover',
    width: '100%',
  },
  imageTexture: {
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.03) 100%)',
    inset: 0,
    mixBlendMode: 'screen',
    position: 'absolute',
  },
  gradient: {
    inset: 0,
    position: 'absolute',
  },
  frameLine: {
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 48,
    inset: 34,
    position: 'absolute',
  },
  accentBeam: {
    borderRadius: 999,
    height: 8,
    left: 48,
    position: 'absolute',
    right: 48,
    top: 42,
  },
  sceneExitVeil: {
    inset: 0,
    position: 'absolute',
  },
  metaKicker: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
  infoChip: {
    alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 999,
    color: '#f7f1e4',
    display: 'inline-flex',
    fontSize: 24,
    fontWeight: 600,
    minHeight: 44,
    padding: '0 18px',
  },
  focusShell: {
    justifyContent: 'space-between',
    padding: '72px 64px 76px',
  },
  focusTopMeta: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  focusCard: {
    alignSelf: 'flex-end',
    backdropFilter: 'blur(14px)',
    background:
      'linear-gradient(180deg, rgba(10,10,12,0.18), rgba(10,10,12,0.62))',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 34,
    display: 'grid',
    gap: 18,
    maxWidth: 760,
    padding: '28px 30px 30px',
  },
  focusHeadline: {
    color: '#ffffff',
    fontSize: 94,
    fontWeight: 800,
    lineHeight: 1.02,
    margin: 0,
    textShadow: '0 16px 46px rgba(0,0,0,0.34)',
  },
  focusNarration: {
    color: 'rgba(245,239,228,0.92)',
    fontSize: 34,
    lineHeight: 1.35,
    margin: 0,
  },
  splitShell: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '90px 68px',
  },
  splitCard: {
    backdropFilter: 'blur(16px)',
    background:
      'linear-gradient(180deg, rgba(10,10,12,0.24), rgba(10,10,12,0.72))',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 34,
    display: 'grid',
    gap: 20,
    maxWidth: 540,
    padding: '30px 30px 32px',
  },
  splitHeadline: {
    color: '#ffffff',
    fontSize: 82,
    fontWeight: 800,
    lineHeight: 1.02,
    margin: 0,
  },
  splitNarration: {
    color: 'rgba(245,239,228,0.92)',
    fontSize: 32,
    lineHeight: 1.34,
    margin: 0,
  },
  posterShell: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
  },
  posterCard: {
    alignItems: 'center',
    backdropFilter: 'blur(16px)',
    background:
      'linear-gradient(180deg, rgba(12,12,16,0.24), rgba(12,12,16,0.72))',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 42,
    display: 'grid',
    gap: 20,
    justifyItems: 'center',
    maxWidth: 820,
    padding: '34px 42px 38px',
    textAlign: 'center',
  },
  posterHeadline: {
    color: '#ffffff',
    fontSize: 102,
    fontWeight: 800,
    lineHeight: 0.98,
    margin: 0,
    textWrap: 'balance',
  },
  posterNarration: {
    color: 'rgba(245,239,228,0.92)',
    fontSize: 32,
    lineHeight: 1.34,
    margin: 0,
    maxWidth: 680,
  },
  editorialShell: {
    justifyContent: 'space-between',
    padding: '84px 66px 74px',
  },
  editorialTop: {
    display: 'grid',
    gap: 18,
    maxWidth: 700,
  },
  editorialHeadline: {
    color: '#ffffff',
    fontSize: 92,
    fontWeight: 800,
    lineHeight: 1.02,
    margin: 0,
    textShadow: '0 16px 42px rgba(0,0,0,0.34)',
  },
  editorialNote: {
    alignSelf: 'flex-end',
    backdropFilter: 'blur(16px)',
    background:
      'linear-gradient(180deg, rgba(10,10,12,0.22), rgba(10,10,12,0.70))',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 30,
    display: 'grid',
    gap: 18,
    maxWidth: 460,
    padding: '26px 26px 28px',
  },
  editorialNarration: {
    color: 'rgba(245,239,228,0.92)',
    fontSize: 30,
    lineHeight: 1.34,
    margin: 0,
  },
} satisfies Record<string, React.CSSProperties>;
