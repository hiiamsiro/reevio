import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000',
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const storagePath = configService.get<string>('STORAGE_PATH', './storage');

  await mkdir(resolve(storagePath), { recursive: true });
  app.useStaticAssets(resolve(storagePath), {
    prefix: '/storage/',
  });

  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();
