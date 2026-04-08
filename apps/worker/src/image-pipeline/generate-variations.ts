import { GeneratedImageVariation } from '@reevio/types';

const VARIATIONS_PER_PROMPT = 3;

export function generateVariations(
  imagePrompts: string[],
  videoId: string
): GeneratedImageVariation[] {
  return imagePrompts.flatMap((prompt, promptIndex) =>
    Array.from({ length: VARIATIONS_PER_PROMPT }, (_, variationIndex) => ({
      id: `${videoId}-variation-${promptIndex + 1}-${variationIndex + 1}`,
      prompt,
      sourcePromptId: `${videoId}-prompt-${promptIndex + 1}`,
      url: `images/${videoId}/prompt-${promptIndex + 1}-variation-${variationIndex + 1}.png`,
      score: calculateVariationScore(promptIndex, variationIndex),
    }))
  );
}

function calculateVariationScore(promptIndex: number, variationIndex: number): number {
  const baseScore = 0.93 - promptIndex * 0.03;
  const variationPenalty = variationIndex * 0.05;

  return Number((baseScore - variationPenalty).toFixed(2));
}
