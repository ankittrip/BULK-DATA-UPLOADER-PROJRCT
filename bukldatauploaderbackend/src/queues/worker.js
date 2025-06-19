// src/queues/worker.js
import { Worker } from "bullmq";
import { handleJob } from "../workers/csvProcessor.worker.js";
import dotenv from "dotenv";
dotenv.config();

const worker = new Worker(
  "file-processing",
  async (job) => {
    console.log(`📥 Processing job ${job.id}`);
    await handleJob(job.data); // { filePath, jobId }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});
