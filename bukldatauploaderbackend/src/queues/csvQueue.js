// src/queues/csvQueue.js
import dotenv from "dotenv";
dotenv.config();

import { Queue } from "bullmq";

export const csvQueue = new Queue("csv-processing-queue", {
  connection: {
    url: process.env.REDIS_URL,
  },
});
