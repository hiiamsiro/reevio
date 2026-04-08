import { PrismaClient } from '@prisma/client';
import { Worker } from 'bullmq';
import { VideoGenerationJobData, VIDEO_GENERATION_QUEUE_NAME } from '@reevio/types';
import 'reflect-metadata';
import { validateEnv } from './config/validate-env';
import { processVideoGenerationJob } from './pipeline/process-video-generation-job';

async function main(): Promise<void> {
  const env = validateEnv(process.env);
  const prismaClient = new PrismaClient();
  const worker = new Worker<VideoGenerationJobData>(
    VIDEO_GENERATION_QUEUE_NAME,
    async (job) => {
      await processVideoGenerationJob(prismaClient, job.data);
    },
    {
      connection: {
        url: env.REDIS_URL,
      },
      concurrency: 2,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[worker] Job ${job?.id} failed: ${error.message}`);
  });

  console.log(
    `[worker] Listening on queue "${VIDEO_GENERATION_QUEUE_NAME}" with redis ${env.REDIS_URL}`
  );

  const shutdown = async (): Promise<void> => {
    await worker.close();
    await prismaClient.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Worker failed to start.');
  }

  process.exit(1);
});
