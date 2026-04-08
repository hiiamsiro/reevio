import { Worker, Queue } from 'bullmq';
import { z } from 'zod';
import 'reflect-metadata';

const renderJobSchema = z.object({
  projectId: z.string().uuid(),
  templateId: z.string(),
  provider: z.enum(['remotion', 'topview', 'grok', 'flow', 'veo']),
  params: z.record(z.unknown()),
});

interface RenderJobData {
  projectId: string;
  templateId: string;
  provider: string;
  params: Record<string, unknown>;
}

async function main() {
  const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379';

  const renderQueue = new Queue<RenderJobData>('video-render', {
    connection: { url: redisUrl },
  });

  const worker = new Worker<RenderJobData>(
    'video-render',
    async (job) => {
      const data = renderJobSchema.parse(job.data);
      console.log(`[worker] Processing job ${job.id} for project ${data.projectId} using ${data.provider}`);

      // TODO: route to provider-specific handler
      switch (data.provider) {
        case 'remotion':
        case 'topview':
        case 'grok':
        case 'flow':
        case 'veo':
          break;
        default:
          throw new Error(`Unknown provider: ${data.provider}`);
      }
    },
    {
      connection: { url: redisUrl },
      concurrency: 4,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[worker] Job ${job?.id} failed:`, err.message);
  });

  console.log(`[worker] Listening on queue "video-render" — redis: ${redisUrl}`);

  process.on('SIGTERM', async () => {
    console.log('[worker] Shutting down...');
    await worker.close();
    await renderQueue.close();
    process.exit(0);
  });
}

main().catch(console.error);
