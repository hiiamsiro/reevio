import { Env } from '@reevio/config';

export interface StorageRuntimeConfig {
  readonly driver: 'local';
  readonly storagePath: string;
}

export function getStorageRuntimeConfig(
  storageDriver: Env['STORAGE_DRIVER'],
  storagePath: string
): StorageRuntimeConfig {
  switch (storageDriver) {
    case 'local':
      return {
        driver: 'local',
        storagePath,
      };
    default:
      throw new Error(`Unsupported storage driver "${storageDriver}".`);
  }
}
