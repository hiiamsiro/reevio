import { isAbsolute, join, relative, resolve } from 'node:path';

export function resolveLocalStoragePath(url: string): string | null {
  if (process.env['STORAGE_DRIVER'] !== 'local') {
    return null;
  }

  const storagePath = process.env['STORAGE_PATH'];
  const publicBaseUrl = process.env['STORAGE_PUBLIC_BASE_URL'];

  if (!storagePath || !publicBaseUrl) {
    return null;
  }

  const normalizedBase = `${publicBaseUrl.replace(/\/$/, '')}/storage/`;

  if (!url.startsWith(normalizedBase)) {
    return null;
  }

  const relativePath = url.slice(normalizedBase.length);
  const storageRoot = resolve(storagePath);
  const absolutePath = resolve(join(storageRoot, relativePath));
  const relativeTargetPath = relative(storageRoot, absolutePath);

  if (
    relativePath.length === 0 ||
    relativeTargetPath.startsWith('..') ||
    isAbsolute(relativeTargetPath)
  ) {
    throw new Error(`Storage URL "${url}" resolves outside of local storage root.`);
  }

  return absolutePath;
}
