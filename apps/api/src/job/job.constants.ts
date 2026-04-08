export const JOB_STATUS_VALUES = ['queued', 'processing', 'completed', 'failed'] as const;

export const JOB_MAX_ATTEMPTS = 4;
export const JOB_BACKOFF_DELAY_MS = 2000;
