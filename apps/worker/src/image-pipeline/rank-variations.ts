import { RankedImageVariation, ValidatedImageVariation } from '@reevio/types';

export function rankVariations(
  validatedVariations: ValidatedImageVariation[]
): RankedImageVariation[] {
  const groupedVariations = groupByPrompt(validatedVariations);

  return Object.values(groupedVariations).flatMap((variations) =>
    [...variations]
      .sort((leftVariation, rightVariation) => rightVariation.score - leftVariation.score)
      .map((variation, index) => ({
        ...variation,
        rank: index + 1,
      }))
  );
}

function groupByPrompt(
  variations: ValidatedImageVariation[]
): Record<string, ValidatedImageVariation[]> {
  return variations.reduce<Record<string, ValidatedImageVariation[]>>((groups, variation) => {
    const existingGroup = groups[variation.sourcePromptId] ?? [];

    return {
      ...groups,
      [variation.sourcePromptId]: [...existingGroup, variation],
    };
  }, {});
}
