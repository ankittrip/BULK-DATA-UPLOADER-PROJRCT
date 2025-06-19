export const DB_name = "bulkUploadDB"

export const JOB_STATUS = {
  PENDING: "pending",
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
}

export const EMAIL_TEMPLATES = {
  JOB_STARTED: "jobStarted",
  JOB_COMPLETED: "jobCompleted",
  JOB_FAILED: "jobFailed",
  WEEKLY_REPORT: "weeklyReport",
}

export const BATCH_SIZE = 1000
export const MAX_FILE_SIZE = 100 * 1024 * 1024 
export const ALLOWED_FILE_TYPES = [".csv"]

// Redis Queue Names
export const QUEUE_NAMES = {
  RECORD_PROCESSING: "record-queue",
  EMAIL_NOTIFICATIONS: "email-queue",
  FILE_CLEANUP: "cleanup-queue",
}

// Processing Constants
export const PROCESSING = {
  BATCH_SIZE: 1000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  CONCURRENCY: 3,
}

// Email Constants
export const EMAIL_CONFIG = {
  DAILY_LIMIT: 500,
  BATCH_SIZE: 5,
  BATCH_DELAY: 2000,
  RETRY_ATTEMPTS: 3,
}
