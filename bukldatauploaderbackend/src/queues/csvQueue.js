// src/queues/csvQueue.js
import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined in the environment variables");
}

export const csvQueue = new Queue("csv-processing-queue", {
  connection: {
    url: redisUrl,
  },
});
