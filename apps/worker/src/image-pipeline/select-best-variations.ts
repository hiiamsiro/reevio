import { GeneratedImageAsset, RankedImageVariation } from '@reevio/types';

export function selectBestVariations(
  rankedVariations: RankedImageVariation[]
): GeneratedImageAsset[] {
  const groupedVariations = groupByPrompt(rankedVariations);

  return Object.values(groupedVariations).map((variations) => {
    const bestVariation = variations.find((variation) => variation.isValid && variation.rank === 1);

    if (!bestVariation) {
      throw new Error(`No valid image variation available for prompt "${variations[0]?.sourcePromptId}".`);
    }

    return {
      id: bestVariation.id,
      prompt: bestVariation.prompt,
      url: bestVariation.url,
      score: bestVariation.score,
    };
  });
}

function groupByPrompt(
  variations: RankedImageVariation[]
): Record<string, RankedImageVariation[]> {
  return variations.reduce<Record<string, RankedImageVariation[]>>((groups, variation) => {
    const existingGroup = groups[variation.sourcePromptId] ?? [];

    return {
      ...groups,
      [variation.sourcePromptId]: [...existingGroup, variation],
    };
  }, {});
}
