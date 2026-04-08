import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@reevio/config';
import { JobModule } from './job/job.module';
import { ProviderModule } from './provider/provider.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
      validationOptions: {
        convert: true,
      },
      ignoreEnvFile: false,
    }),
    ProviderModule,
    JobModule,
    VideoModule,
  ],
})
export class AppModule {}
