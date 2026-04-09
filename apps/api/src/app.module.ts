import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import { ProviderModule } from './provider/provider.module';
import { PrismaModule } from './prisma/prisma.module';
import { validateEnv } from './config/validate-env';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      ignoreEnvFile: false,
    }),
    PrismaModule,
    AuthModule,
    ProviderModule,
    JobModule,
    VideoModule,
  ],
})
export class AppModule {}
