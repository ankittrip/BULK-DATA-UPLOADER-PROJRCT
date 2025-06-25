// src/queues/csvQueue.js
import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

export const csvQueue = new Queue("csv-processing-queue", {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: "default",
    password: process.env.REDIS_PASSWORD,
    tls: {},
  },
});
