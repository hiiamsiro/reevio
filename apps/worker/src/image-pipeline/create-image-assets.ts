import { GeneratedImageAsset } from '@reevio/types';
import { generateVariations } from './generate-variations';
import { rankVariations } from './rank-variations';
import { selectBestVariations } from './select-best-variations';
import { validateVariations } from './validate-variations';

export function createImageAssets(
  imagePrompts: string[],
  videoId: string
): GeneratedImageAsset[] {
  const variations = generateVariations(imagePrompts, videoId);
  const validatedVariations = validateVariations(variations);
  const rankedVariations = rankVariations(validatedVariations);

  return selectBestVariations(rankedVariations);
}
