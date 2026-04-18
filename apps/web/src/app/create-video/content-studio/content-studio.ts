import type {
  ExportFormatDefinition,
  ExportFormatInput,
  PostingPreparation,
  PostingPreparationInput,
  PromptWithCreativeDirectivesInput,
  RewriteVariationInput,
  TrendIdea,
  VideoTemplateDefinition,
} from './content-studio.types';

const FALLBACK_PRODUCT_FOCUS = 'your story';
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

export function createPostingPreparation(
  input: PostingPreparationInput
): PostingPreparation {
  const headline = getPreviewHeadline(input);
  const summary = getPreviewBody(input.prompt);
  const productFocus = getProductFocus(normalizeBriefText(input.prompt));
  const hashtags = [
    '#shortformvideo',
    '#contentstudio',
    `#${productFocus.replace(/\s+/g, '')}`,
    '#videomarketing',
  ].join(' ');

  return {
    title: headline.length > 72 ? `${headline.slice(0, 69)}...` : headline,
    caption: `${headline}\n\n${summary}\n\nBuilt for a clean short-form cut with a fast payoff.`,
    hashtags,
  };
}

export function createRewriteVariations(
  input: RewriteVariationInput
): string[] {
  const normalizedPrompt = input.prompt.trim();
  const basePrompt =
    normalizedPrompt.length > 0
      ? normalizedPrompt
      : 'Create a short-form video with a clear opening, visual payoff, and memorable finish.';

  return [
    `Keep the pacing tight, clarify the opening beat, and end on a clean visual payoff. ${basePrompt}`,
    `Build this as a creator-friendly short with one clear product moment and a stronger ending. ${basePrompt}`,
    `Turn this into a fast vertical video with clearer scene motion and cleaner captions. ${basePrompt}`,
  ];
}

export function createTrendIdeas(prompt: string): TrendIdea[] {
  const productFocus = getProductFocus(normalizeBriefText(prompt));

  return [
    {
      topic: 'Pattern interrupt open',
      idea: `Start ${productFocus} with a surprising visual or line that earns the first three seconds.`,
    },
    {
      topic: 'Demo payoff',
      idea: `Show ${productFocus} in action before explaining it so the result lands faster.`,
    },
    {
      topic: 'Comment bait close',
      idea: `End the ${productFocus} cut with a question or opinion trigger that invites responses.`,
    },
  ];
}

export function createVideoTemplates(): VideoTemplateDefinition[] {
  return [
    {
      id: 'creator-demo',
      name: 'Creator Demo',
      preview: 'Fast personal intro, hands-on demo, confident wrap-up.',
      prompt:
        'Create a creator-led short video that opens with a relatable problem, demonstrates the product quickly, and ends with a polished recap.',
    },
    {
      id: 'feature-spotlight',
      name: 'Feature Spotlight',
      preview: 'One sharp feature story with bold visuals and crisp captions.',
      prompt:
        'Create a short-form feature spotlight video with one standout capability, tight pacing, and a clean final scene.',
    },
    {
      id: 'launch-teaser',
      name: 'Launch Teaser',
      preview: 'High-energy reveal, product motion, and memorable last frame.',
      prompt:
        'Create a launch teaser video with a dramatic opening, motion-heavy product reveal, and a closing frame built for social feeds.',
    },
    {
      id: 'story-first',
      name: 'Story First',
      preview: 'Narrative opening, emotional midpoint, and satisfying payoff.',
      prompt:
        'Create a short video that tells a compact story, introduces the product through a human moment, and lands on a strong visual payoff.',
    },
  ];
}

export function buildPromptWithCreativeDirectives(
  input: PromptWithCreativeDirectivesInput
): string {
  return input.prompt.trim();
}

export function createExportFormats(
  input: ExportFormatInput
): ExportFormatDefinition[] {
  const previewHeadline = getPreviewHeadline(input);
  const previewBody = getPreviewBody(input.prompt);

  return [
    {
      id: 'tiktok-9x16',
      platform: 'TikTok',
      label: 'TikTok 9:16',
      aspectRatio: '9:16',
      canvas: '1080 x 1920',
      layoutLabel:
        'Vertical framing with stacked captions, product-safe center crop, and room for a final end frame.',
      previewHeadline,
      previewBody,
    },
    {
      id: 'reels-9x16',
      platform: 'Instagram Reels',
      label: 'Reels 9:16',
      aspectRatio: '9:16',
      canvas: '1080 x 1920',
      layoutLabel:
        'Vertical social layout with punchier top-third text and softer caption density near the footer.',
      previewHeadline,
      previewBody,
    },
    {
      id: 'shorts-9x16',
      platform: 'YouTube Shorts',
      label: 'Shorts 9:16',
      aspectRatio: '9:16',
      canvas: '1080 x 1920',
      layoutLabel:
        'Vertical storytelling cut with extra room for mid-frame subject motion and subtitle safety.',
      previewHeadline,
      previewBody,
    },
    {
      id: 'square-1x1',
      platform: 'Square Social',
      label: 'Square 1:1',
      aspectRatio: '1:1',
      canvas: '1080 x 1080',
      layoutLabel:
        'Balanced square crop for feed posts, centered focal point, and tighter text hierarchy.',
      previewHeadline,
      previewBody,
    },
    {
      id: 'portrait-4x5',
      platform: 'Portrait Feed',
      label: 'Portrait 4:5',
      aspectRatio: '4:5',
      canvas: '1080 x 1350',
      layoutLabel:
        'Feed-optimized portrait frame with more room for subject detail and a lighter caption load.',
      previewHeadline,
      previewBody,
    },
  ];
}

function normalizeBriefText(briefText: string): string {
  return briefText.trim().replace(/\s+/g, ' ');
}

function getProductFocus(briefText: string): string {
  if (briefText.length === 0) {
    return FALLBACK_PRODUCT_FOCUS;
  }

  const words = briefText
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 1 && !STOP_WORDS.includes(word));

  if (words.length === 0) {
    return FALLBACK_PRODUCT_FOCUS;
  }

  return words.slice(0, 3).join(' ');
}

function getPreviewHeadline(input: ExportFormatInput): string {
  const promptPreview = getPreviewBody(input.prompt);

  if (promptPreview.length > 0) {
    return promptPreview;
  }

  return 'Your short-form preview will appear here.';
}

function getPreviewBody(prompt: string): string {
  const normalizedPrompt = prompt.trim().replace(/\s+/g, ' ');

  if (normalizedPrompt.length === 0) {
    return 'Add a brief to preview how this cut will adapt across short-form formats.';
  }

  return normalizedPrompt.length > 112
    ? `${normalizedPrompt.slice(0, 109)}...`
    : normalizedPrompt;
}
