import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const PLACEHOLDER_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnHCf8AAAAASUVORK5CYII=';

export class LocalStorageService {
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

  private toPublicUrl(relativePath: string): string {
    const normalizedPath = relativePath.replace(/\\/g, '/');

    return `${this.publicBaseUrl.replace(/\/$/, '')}/storage/${normalizedPath}`;
  }
}

export function createLocalStorageService(): LocalStorageService {
  return new LocalStorageService(
    process.env['STORAGE_PATH'] ?? './storage',
    process.env['API_URL'] ?? 'http://localhost:4000'
  );
}
