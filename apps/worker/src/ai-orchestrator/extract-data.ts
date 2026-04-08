import { ParsedPromptData } from '@reevio/types';
import { runWithRetryAndFallback } from './run-with-retry-and-fallback';

const AI_STEP_RETRIES = 2;

export async function extractData(prompt: string): Promise<ParsedPromptData> {
  return runWithRetryAndFallback({
    label: 'extractData',
    retries: AI_STEP_RETRIES,
    primaryTask: async () => extractPrimaryData(prompt),
    fallbackTask: async () => extractFallbackData(prompt),
  });
}

function extractPrimaryData(prompt: string): ParsedPromptData {
  const normalizedPrompt = prompt.trim();
  const promptWords = normalizedPrompt.split(/\s+/).filter((word) => word.length > 0);

  if (promptWords.length < 4) {
    throw new Error('Prompt is too short for primary data extraction.');
  }

  return {
    rawPrompt: normalizedPrompt,
    productName: detectProductName(normalizedPrompt),
    audience: detectAudience(normalizedPrompt),
    primaryGoal: detectPrimaryGoal(normalizedPrompt),
    highlights: extractHighlights(normalizedPrompt),
  };
}

function extractFallbackData(prompt: string): ParsedPromptData {
  const normalizedPrompt = prompt.trim();
  const promptWords = normalizedPrompt.split(/\s+/).filter((word) => word.length > 0);

  if (promptWords.length === 0) {
    throw new Error('Prompt is empty.');
  }

  return {
    rawPrompt: normalizedPrompt,
    productName: promptWords.slice(0, 4).join(' '),
    audience: 'affiliate shoppers',
    primaryGoal: 'drive clicks and conversions',
    highlights: promptWords.slice(0, 8),
  };
}

function detectProductName(prompt: string): string {
  const productMatch = prompt.match(/for ([^.!,]+?)( with|$)/i);

  if (productMatch?.[1]) {
    return productMatch[1].trim();
  }

  const promptWords = prompt.split(/\s+/).filter((word) => word.length > 0);

  return promptWords.slice(0, 4).join(' ');
}

function detectAudience(prompt: string): string {
  if (prompt.toLowerCase().includes('affiliate')) {
    return 'affiliate shoppers';
  }

  if (prompt.toLowerCase().includes('creator')) {
    return 'social-first creators';
  }

  return 'high-intent buyers';
}

function detectPrimaryGoal(prompt: string): string {
  if (prompt.toLowerCase().includes('cta')) {
    return 'drive clicks and conversions';
  }

  if (prompt.toLowerCase().includes('awareness')) {
    return 'increase product awareness';
  }

  return 'turn attention into action';
}

function extractHighlights(prompt: string): string[] {
  return prompt
    .split(/,|with|and/gi)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .slice(0, 4);
}
