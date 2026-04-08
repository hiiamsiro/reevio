import { LocalStorageService } from './local-storage.service';
import { StorageService } from './storage.types';

export function createStorageService(): StorageService {
  const storageDriver = process.env['STORAGE_DRIVER'] ?? 'local';

  switch (storageDriver) {
    case 'local':
      return new LocalStorageService(
        process.env['STORAGE_PATH'] ?? './storage',
        process.env['STORAGE_PUBLIC_BASE_URL'] ??
          process.env['API_URL'] ??
          'http://localhost:4000'
      );
    default:
      throw new Error(`Unsupported storage driver "${storageDriver}".`);
  }
}
