import type { ExportFormatId } from './content-studio';
import type {
  BulkJobStatus,
  CreateExportBriefInput,
  CreatePerformanceInsightInput,
  DownloadTextFileInput,
  PerformanceInsight,
  ProviderDefinition,
  WatermarkPosition,
} from './page.types';

export function toPriceTierLabel(priceTier: ProviderDefinition['priceTier']): string {
  return priceTier.charAt(0).toUpperCase() + priceTier.slice(1);
}

export function createExportBrief(input: CreateExportBriefInput): string {
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

export function downloadTextFile(input: DownloadTextFileInput): void {
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

export function getExportFrameClassName(
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

export function getWatermarkPositionClassName(
  watermarkPosition: WatermarkPosition,
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

export function toBulkJobStatus(videoStatus: string): BulkJobStatus {
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

export function createPerformanceInsight(
  input: CreatePerformanceInsightInput
): PerformanceInsight {
  const viewCount = Number(input.views) || 0;
  const likeCount = Number(input.likes) || 0;
  const averageWatchTime = Number(input.watchTime) || 0;
  const engagementRate = viewCount > 0 ? (likeCount / viewCount) * 100 : 0;

  if (engagementRate >= 6 && averageWatchTime >= 15) {
    return {
      health: 'Strong',
      suggestion:
        'Keep the hook structure and test a stronger CTA to squeeze more conversion from healthy retention.',
    };
  }

  if (engagementRate >= 3) {
    return {
      health: 'Stable',
      suggestion:
        'Tighten the opening three seconds and push more emotional contrast before the offer lands.',
    };
  }

  return {
    health: 'Needs work',
    suggestion:
      'Rebuild the hook, shorten the setup, and add faster payoff so watch time lifts earlier in the cut.',
  };
}
