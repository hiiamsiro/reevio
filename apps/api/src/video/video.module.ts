import { Module } from '@nestjs/common';
import { JobModule } from '../job/job.module';
import { ProviderModule } from '../provider/provider.module';
import { PrismaModule } from '../prisma/prisma.module';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [PrismaModule, ProviderModule, JobModule],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
