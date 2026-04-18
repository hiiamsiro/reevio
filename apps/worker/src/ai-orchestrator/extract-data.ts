import { ParsedPromptData } from '@reevio/types';
import { createExtractDataPromptTemplate } from '../prompt-engine/prompt-templates';
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
  const promptTemplate = createExtractDataPromptTemplate(prompt);
  const normalizedPrompt = prompt.trim();
  const promptWords = normalizedPrompt.split(/\s+/).filter((word) => word.length > 0);

  if (promptWords.length < 4) {
    throw new Error('Prompt is too short for primary data extraction.');
  }

  if (!promptTemplate.userInstruction.includes(normalizedPrompt)) {
    throw new Error('Prompt template did not embed the source brief.');
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
  const promptTemplate = createExtractDataPromptTemplate(prompt);
  const normalizedPrompt = prompt.trim();
  const promptWords = normalizedPrompt.split(/\s+/).filter((word) => word.length > 0);

  if (promptWords.length === 0) {
    throw new Error('Prompt is empty.');
  }

  if (promptTemplate.systemInstruction.length === 0) {
    throw new Error('Fallback extract-data prompt template is empty.');
  }

  return {
    rawPrompt: normalizedPrompt,
    productName: detectProductName(normalizedPrompt),
    audience: 'short-form viewers',
    primaryGoal: 'hold attention and land the payoff',
    highlights: promptWords.slice(0, 8),
  };
}

function detectProductName(prompt: string): string {
  const promptBody = stripCreativeDirectives(prompt);
  const productPatterns = [
    /(?:create|make|render|generate)\s+(?:an?\s+)?(?:affiliate|promo|marketing|ugc|social(?:-first)?|short-form|short)?\s*video\s+for\s+(.+?)(?:[.!?\n]|(?:\s+(?:with|using|featuring|targeting|that|who|to|for)\b)|$)/i,
    /(?:create|make|render|generate)\s+(?:an?\s+)?(?:affiliate|promo|marketing|ugc|social(?:-first)?|short-form|short)?\s*video\s+about\s+(.+?)(?:[.!?\n]|(?:\s+(?:with|using|featuring|targeting|that|who|to|for)\b)|$)/i,
    /^(.+?)\s+for\s+.+$/i,
    /\bfor\s+(.+?)(?:[.!?\n]|(?:\s+(?:with|using|featuring|targeting|that|who|to|for)\b)|$)/i,
    /\babout\s+(.+?)(?:[.!?\n]|(?:\s+(?:with|using|featuring|targeting|that|who|to|for)\b)|$)/i,
  ];

  for (const pattern of productPatterns) {
    const productMatch = promptBody.match(pattern);

    if (productMatch?.[1]) {
      return sanitizeProductName(productMatch[1]);
    }
  }

  const fallbackSource = promptBody.length > 0 ? promptBody : prompt;

  return summarizeProductName(fallbackSource);
}

function stripCreativeDirectives(prompt: string): string {
  return prompt
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^lead with hook:/i.test(line))
    .filter((line) => !/^close with cta\b/i.test(line))
    .join(' ');
}

function sanitizeProductName(value: string): string {
  return value
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/[,:;]+$/g, '')
    .replace(/^(?:an?|the)\s+/i, '')
    .trim();
}

function summarizeProductName(prompt: string): string {
  const normalizedPrompt = prompt
    .trim()
    .replace(/^(?:create|make|render|generate)\s+/i, '')
    .replace(
      /^(?:an?\s+)?(?:affiliate|promo|marketing|ugc|social(?:-first)?|short-form|short)\s+video\b/i,
      ''
    )
    .replace(/^(?:for|about)\s+/i, '')
    .trim();
  const firstClause = normalizedPrompt
    .split(/\b(?:with|using|featuring|targeting|that|who|to|for)\b/i)[0]
    ?.trim();
  const promptWords = (firstClause || normalizedPrompt)
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return promptWords.slice(0, 5).join(' ');
}

function detectAudience(prompt: string): string {
  if (prompt.toLowerCase().includes('affiliate')) {
    return 'shoppers comparing offers';
  }

  if (prompt.toLowerCase().includes('creator')) {
    return 'social-first creators';
  }

  return 'short-form viewers';
}

function detectPrimaryGoal(prompt: string): string {
  if (prompt.toLowerCase().includes('cta')) {
    return 'guide viewers toward the next action';
  }

  if (prompt.toLowerCase().includes('awareness')) {
    return 'increase product awareness';
  }

  return 'turn attention into a clear payoff';
}

function extractHighlights(prompt: string): string[] {
  return prompt
    .split(/,|with|and/gi)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .slice(0, 4);
}
