import { Env, envSchema } from '@reevio/config';

export function validateEnv(config: Record<string, unknown>): Env {
  const parsedConfig = envSchema.safeParse(config);

  if (!parsedConfig.success) {
    const errorDetails = parsedConfig.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    throw new Error(
      JSON.stringify(
        {
          code: 'INVALID_WORKER_ENVIRONMENT_CONFIGURATION',
          errorDetails,
        },
        null,
        2
      )
    );
  }

  return parsedConfig.data;
}
