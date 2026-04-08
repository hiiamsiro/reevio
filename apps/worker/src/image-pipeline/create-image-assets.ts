import { GeneratedImageAsset } from '@reevio/types';
import { StorageService } from '../storage/storage.types';
import { generateVariations } from './generate-variations';
import { rankVariations } from './rank-variations';
import { selectBestVariations } from './select-best-variations';
import { validateVariations } from './validate-variations';

export async function createImageAssets(
  imagePrompts: string[],
  videoId: string,
  storageService: StorageService
): Promise<GeneratedImageAsset[]> {
  const variations = generateVariations(imagePrompts, videoId);
  const validatedVariations = validateVariations(variations);
  const rankedVariations = rankVariations(validatedVariations);
  const selectedVariations = selectBestVariations(rankedVariations);

  return Promise.all(
    selectedVariations.map(async (variation) => ({
      ...variation,
      url: await storageService.savePlaceholderImage(
        `images/${videoId}/${variation.id.replace(`${videoId}-`, '')}.png`
      ),
    }))
  );
}
