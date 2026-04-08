import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { StorageService } from './storage.types';

const PLACEHOLDER_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnHCf8AAAAASUVORK5CYII=';

export class LocalStorageService implements StorageService {
  public constructor(
    private readonly storagePath: string,
    private readonly publicBaseUrl: string
  ) {}

  public async saveTextFile(relativePath: string, content: string): Promise<string> {
    const absolutePath = join(this.storagePath, relativePath);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, 'utf8');

    return this.toPublicUrl(relativePath);
  }

  public async savePlaceholderImage(relativePath: string): Promise<string> {
    const absolutePath = join(this.storagePath, relativePath);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, Buffer.from(PLACEHOLDER_PNG_BASE64, 'base64'));

    return this.toPublicUrl(relativePath);
  }

  public async compressJsonArtifact(publicUrl: string): Promise<void> {
    const absolutePath = this.toAbsolutePath(publicUrl);
    const fileContents = await readFile(absolutePath, 'utf8');
    const parsedJson = parseJsonArtifact(fileContents, publicUrl);
    await writeFile(absolutePath, JSON.stringify(parsedJson), 'utf8');
  }

  private toPublicUrl(relativePath: string): string {
    const normalizedPath = relativePath.replace(/\\/g, '/');

    return `${this.getPublicPrefix()}${normalizedPath}`;
  }

  private toAbsolutePath(publicUrl: string): string {
    const publicPrefix = this.getPublicPrefix();

    if (!publicUrl.startsWith(publicPrefix)) {
      throw new Error(
        `Storage URL "${publicUrl}" does not start with expected prefix "${publicPrefix}".`
      );
    }

    const relativePath = publicUrl.slice(publicPrefix.length);
    const storageRoot = resolve(this.storagePath);
    const absolutePath = resolve(join(storageRoot, relativePath));
    const relativeTargetPath = relative(storageRoot, absolutePath);

    if (
      relativePath.length === 0 ||
      relativeTargetPath.startsWith('..') ||
      isAbsolute(relativeTargetPath)
    ) {
      throw new Error(`Storage URL "${publicUrl}" resolves outside of storage root.`);
    }

    return absolutePath;
  }

  private getPublicPrefix(): string {
    return `${this.publicBaseUrl.replace(/\/$/, '')}/storage/`;
  }
}

function parseJsonArtifact(fileContents: string, publicUrl: string): unknown {
  try {
    return JSON.parse(fileContents);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown JSON parse error.';

    throw new Error(
      `Storage artifact "${publicUrl}" is not valid JSON and cannot be compressed: ${errorMessage}`
    );
  }
}
