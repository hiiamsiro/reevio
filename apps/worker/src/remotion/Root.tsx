import React from 'react';
import { Composition } from 'remotion';
import type { CalculateMetadataFunction } from 'remotion';
import { FPS, VideoComposition } from './VideoComposition';
import type { RemotionVideoProps } from './remotion.types';

const calculateMetadata: CalculateMetadataFunction<RemotionVideoProps> = ({ props }) => {
  const { width, height } = getDimensions(props.aspectRatio);

  return {
    width,
    height,
    fps: FPS,
    durationInFrames: Math.max(1, Math.round(props.durationInSeconds * FPS)),
  };
};

export function RemotionRoot() {
  return (
    <Composition
      id="reevio-video"
      component={VideoComposition}
      defaultProps={{
        aspectRatio: '9:16',
        builtScenes: [],
        durationInSeconds: 1,
        subtitleCues: [],
        voiceoverUrl: '',
      }}
      calculateMetadata={calculateMetadata}
    />
  );
}

function getDimensions(aspectRatio: RemotionVideoProps['aspectRatio']) {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1920, height: 1080 };
    case '9:16':
      return { width: 1080, height: 1920 };
    case '1:1':
      return { width: 1080, height: 1080 };
    case '4:5':
      return { width: 1080, height: 1350 };
  }
}
