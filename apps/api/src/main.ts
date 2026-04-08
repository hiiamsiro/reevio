import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Env } from '@reevio/config';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AppModule } from './app.module';
import { getStorageRuntimeConfig } from './storage/storage-runtime';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000',
    credentials: true,
  });

  const configService = app.get(ConfigService<Env, true>);
  const port = configService.getOrThrow('PORT', { infer: true });
  const storageRuntimeConfig = getStorageRuntimeConfig(
    configService.getOrThrow('STORAGE_DRIVER', { infer: true }),
    configService.getOrThrow('STORAGE_PATH', { infer: true })
  );

  if (storageRuntimeConfig.driver === 'local') {
    await mkdir(resolve(storageRuntimeConfig.storagePath), { recursive: true });
    app.useStaticAssets(resolve(storageRuntimeConfig.storagePath), {
      prefix: '/storage/',
    });
  }

  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

void bootstrap();
