import { GeneratedImageVariation, ValidatedImageVariation } from '@reevio/types';

export function validateVariations(
  variations: GeneratedImageVariation[]
): ValidatedImageVariation[] {
  return variations.map((variation) => {
    const validationIssues: string[] = [];

    if (variation.prompt.trim().length < 12) {
      validationIssues.push('Prompt is too short.');
    }

    if (!variation.url.startsWith('images/')) {
      validationIssues.push('Variation URL uses an unsupported storage path.');
    }

    if (variation.score <= 0) {
      validationIssues.push('Variation score must be positive.');
    }

    return {
      ...variation,
      isValid: validationIssues.length === 0,
      validationIssues,
    };
  });
}
