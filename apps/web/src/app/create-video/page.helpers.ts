import type { ExportFormatId } from './content-studio';
import type {
  CreateExportBriefInput,
  DownloadTextFileInput,
  ProviderDefinition,
} from './page.types';

export function toPriceTierLabel(
  priceTier: ProviderDefinition['priceTier']
): string {
  return priceTier.charAt(0).toUpperCase() + priceTier.slice(1);
}

export function createExportBrief(input: CreateExportBriefInput): string {
  const sections = [
    `Format: ${input.format.label}`,
    `Platform: ${input.format.platform}`,
    `Canvas: ${input.format.canvas}`,
    `Layout: ${input.format.layoutLabel}`,
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

export function toInlineMediaUrl(mediaUrl: string | null): string | null {
  return mediaUrl;
}

export function getExportFrameClassName(
  exportFormatId: ExportFormatId,
  classNames: Record<string, string>
): string {
  if (exportFormatId === 'square-1x1') {
    return classNames.exportPreviewSquare;
  }

  if (exportFormatId === 'portrait-4x5') {
    return classNames.exportPreviewPortrait;
  }

  return classNames.exportPreviewTall;
}
