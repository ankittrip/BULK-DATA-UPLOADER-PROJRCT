// src/queues/fileWorker.js
import { Worker } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

import { handleJob } from "../workers/csvProcessor.worker.js";

const worker = new Worker(
  "file-processing",
  async (job) => {
    await handleJob(job.data);
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: "default",
      password: process.env.REDIS_PASSWORD,
      tls: {},
    },
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});
