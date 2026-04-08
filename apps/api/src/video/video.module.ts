import { Module } from '@nestjs/common';
import { JobModule } from '../job/job.module';
import { ProviderModule } from '../provider/provider.module';
import { VideoService } from './video.service';

@Module({
  imports: [ProviderModule, JobModule],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
