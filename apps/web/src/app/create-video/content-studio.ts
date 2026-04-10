export interface HookGeneratorInput {
  readonly productDescription: string;
  readonly seed: number;
}

export type CtaType = 'urgency' | 'scarcity' | 'discount';
export type ExportFormatId = 'tiktok-9x16' | 'instagram-1x1' | 'instagram-4x5';

export interface HookOption {
  readonly id: string;
  readonly text: string;
  readonly angle: string;
}

export interface CtaGeneratorInput {
  readonly productDescription: string;
  readonly seed: number;
  readonly type: CtaType;
}

export interface ExportFormatInput {
  readonly prompt: string;
  readonly selectedHookText: string | null;
  readonly ctaText: string | null;
}

export interface ExportFormatDefinition {
  readonly id: ExportFormatId;
  readonly platform: string;
  readonly label: string;
  readonly aspectRatio: '9:16' | '1:1' | '4:5';
  readonly canvas: string;
  readonly layoutLabel: string;
  readonly previewHeadline: string;
  readonly previewBody: string;
  readonly ctaLabel: string;
}

const HOOK_COUNT = 10;
const FALLBACK_PRODUCT_FOCUS = 'this product';
const FALLBACK_HOOK_PREFIX = 'Lead with hook';
const STOP_WORDS = [
  'a',
  'an',
  'and',
  'are',
  'for',
  'from',
  'how',
  'into',
  'that',
  'the',
  'their',
  'this',
  'with',
  'your',
];

const HOOK_TEMPLATES = [
  'Why is {product} suddenly impossible to ignore?',
  'Nobody expects {product} to feel this addictive.',
  'The {product} detail making people stop and stare.',
  '{product} is fixing the frustration nobody names.',
  'This is why {product} feels premium in seconds.',
  'People are replaying {product} for one emotional twist.',
  'The simple reason {product} keeps hitting that wow moment.',
  '{product} looks normal until this reaction kicks in.',
  'Everyone scrolls past ads until {product} opens like this.',
  'The fastest way to make {product} feel irresistible.',
];

export function createHookOptions(input: HookGeneratorInput): HookOption[] {
  const normalizedDescription = normalizeProductDescription(input.productDescription);
  const productFocus = getProductFocus(normalizedDescription);

  return Array.from({ length: HOOK_COUNT }, (_unused, index) => {
    const hookTemplate = HOOK_TEMPLATES[(index + input.seed) % HOOK_TEMPLATES.length];
    const hookText = capitalizeHookText(hookTemplate.replace('{product}', productFocus));

    return {
      id: `hook-${input.seed}-${index + 1}`,
      text: hookText,
      angle: createAngleLabel(index),
    };
  });
}

export function createCtaText(input: CtaGeneratorInput): string {
  const productFocus = getProductFocus(normalizeProductDescription(input.productDescription));
  const typeTemplates = getCtaTemplates(input.type);
  const selectedTemplate = typeTemplates[input.seed % typeTemplates.length];

  return capitalizeHookText(selectedTemplate.replace('{product}', productFocus));
}

export function buildPromptWithCreativeDirectives(input: {
  readonly prompt: string;
  readonly selectedHookText: string | null;
  readonly ctaText: string | null;
}): string {
  const normalizedPrompt = input.prompt.trim();
  const directives = [
    input.selectedHookText ? `${FALLBACK_HOOK_PREFIX}: "${input.selectedHookText}"` : null,
    input.ctaText ? `Close with CTA at the end of the video: "${input.ctaText.trim()}"` : null,
  ].filter((directive): directive is string => directive !== null && directive.trim().length > 0);

  if (directives.length === 0) {
    return normalizedPrompt;
  }

  if (normalizedPrompt.length === 0) {
    return directives.join('\n');
  }

  return `${directives.join('\n')}\n${normalizedPrompt}`;
}

export function toCtaTypeLabel(type: CtaType): string {
  return capitalizeHookText(type);
}

export function createExportFormats(input: ExportFormatInput): ExportFormatDefinition[] {
  const previewHeadline = getPreviewHeadline(input);
  const previewBody = getPreviewBody(input.prompt);
  const ctaLabel = input.ctaText?.trim() || 'Add CTA before export';

  return [
    {
      id: 'tiktok-9x16',
      platform: 'TikTok',
      label: 'TikTok 9:16',
      aspectRatio: '9:16',
      canvas: '1080 x 1920',
      layoutLabel: 'Tall layout with stacked headline, center-safe product framing, and bottom CTA.',
      previewHeadline,
      previewBody,
      ctaLabel,
    },
    {
      id: 'instagram-1x1',
      platform: 'Instagram',
      label: 'Instagram 1:1',
      aspectRatio: '1:1',
      canvas: '1080 x 1080',
      layoutLabel: 'Balanced square layout with centered focal subject and tighter caption density.',
      previewHeadline,
      previewBody,
      ctaLabel,
    },
    {
      id: 'instagram-4x5',
      platform: 'Instagram',
      label: 'Instagram 4:5',
      aspectRatio: '4:5',
      canvas: '1080 x 1350',
      layoutLabel: 'Feed-optimized portrait layout with larger product crop and CTA-safe lower third.',
      previewHeadline,
      previewBody,
      ctaLabel,
    },
  ];
}

function getCtaTemplates(type: CtaType): string[] {
  if (type === 'urgency') {
    return [
      'Shop {product} before tonight slips away.',
      'Tap now before {product} sells through this push.',
      'Move fast if {product} is on your list today.',
    ];
  }

  if (type === 'scarcity') {
    return [
      'Claim {product} before the last batch disappears.',
      'Only a few {product} spots are left this round.',
      'Catch {product} before everyone else clears it out.',
    ];
  }

  return [
    'Unlock 15% off {product} before checkout closes.',
    'Grab the {product} deal while the discount is still live.',
    'Use the offer now and save on {product} today.',
  ];
}

function normalizeProductDescription(productDescription: string): string {
  return productDescription.trim().replace(/\s+/g, ' ');
}

function getProductFocus(productDescription: string): string {
  if (productDescription.length === 0) {
    return FALLBACK_PRODUCT_FOCUS;
  }

  const words = productDescription
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 1 && !STOP_WORDS.includes(word));

  if (words.length === 0) {
    return FALLBACK_PRODUCT_FOCUS;
  }

  return words.slice(0, 3).join(' ');
}

function capitalizeHookText(hookText: string): string {
  if (hookText.length === 0) {
    return hookText;
  }

  return `${hookText.charAt(0).toUpperCase()}${hookText.slice(1)}`;
}

function createAngleLabel(index: number): string {
  const angleLabels = [
    'Shock',
    'Desire',
    'Proof',
    'Pain',
    'Reveal',
    'Contrast',
    'Momentum',
    'Tension',
    'Mystery',
    'Authority',
  ];

  return angleLabels[index] ?? 'Curiosity';
}

function getPreviewHeadline(input: ExportFormatInput): string {
  if (input.selectedHookText?.trim()) {
    return input.selectedHookText.trim();
  }

  const promptPreview = getPreviewBody(input.prompt);

  if (promptPreview.length > 0) {
    return promptPreview;
  }

  return 'Your export preview will appear here.';
}

function getPreviewBody(prompt: string): string {
  const normalizedPrompt = prompt.trim().replace(/\s+/g, ' ');

  if (normalizedPrompt.length === 0) {
    return 'Add a prompt to preview format-specific layout decisions.';
  }

  return normalizedPrompt.length > 96 ? `${normalizedPrompt.slice(0, 93)}...` : normalizedPrompt;
}
