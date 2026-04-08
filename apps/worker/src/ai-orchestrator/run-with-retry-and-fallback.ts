interface RetryableTask<T> {
  readonly label: string;
  readonly retries: number;
  readonly primaryTask: () => Promise<T>;
  readonly fallbackTask: () => Promise<T>;
}

export async function runWithRetryAndFallback<T>(task: RetryableTask<T>): Promise<T> {
  let lastPrimaryError: unknown = null;

  for (let attempt = 1; attempt <= task.retries; attempt += 1) {
    try {
      return await task.primaryTask();
    } catch (error: unknown) {
      lastPrimaryError = error;
      console.warn(
        JSON.stringify({
          level: 'warn',
          task: task.label,
          attempt,
          message: getErrorMessage(error),
        })
      );
    }
  }

  try {
    return await task.fallbackTask();
  } catch (fallbackError: unknown) {
    const primaryErrorMessage = getErrorMessage(lastPrimaryError);
    const fallbackErrorMessage = getErrorMessage(fallbackError);

    throw new Error(
      `AI step "${task.label}" failed after ${task.retries} retries. Primary error: ${primaryErrorMessage}. Fallback error: ${fallbackErrorMessage}.`
    );
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown AI orchestration error';
}
