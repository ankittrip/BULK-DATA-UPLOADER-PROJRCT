// src/queues/fileWorker.js
import { Worker } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

import { handleJob } from "../workers/csvProcessor.worker.js";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

const worker = new Worker(
  "file-processing",
  async (job) => {
    await handleJob(job.data);
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});
