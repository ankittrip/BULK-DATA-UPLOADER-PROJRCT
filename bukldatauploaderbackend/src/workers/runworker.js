// src/workers/runWorker.js
import redisClient from "../config/redis.js";

import { handleJob } from "./csvProcessor.worker.js"; // Ensure correct path

const QUEUE_KEY = "csvQueue";

const runWorker = async () => {
  console.log("Worker started. Waiting for jobs...");

  while (true) {
    try {
      const data = await redisClient.brPop(QUEUE_KEY, 0);

      if (!data || !data.element) {
        console.warn("Received empty job data from Redis");
        continue;
      }

      const job = JSON.parse(data.element);
      console.log(`🔧 Processing job: ${job.jobId}`);

      await handleJob(job);

      console.log(`Job ${job.jobId} finished.`);
    } catch (err) {
      console.error("Worker error:", err.message);
      // Optional: delay to prevent tight error loop
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
};

runWorker().catch((err) => {
  console.error("Worker failed to start:", err.message);
  process.exit(1);
});
