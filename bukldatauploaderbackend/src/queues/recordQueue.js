// src/queues/recordQueue.js
import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

const {
  REDIS_USERNAME = "default",
  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT = 6379,
  REDIS_TLS
} = process.env;

if (!REDIS_PASSWORD || !REDIS_HOST) {
  throw new Error("Missing Redis credentials in environment variables");
}

export const recordQueue = new Queue("record-queue", {
  connection: {
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT),
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    tls: REDIS_TLS === "true" ? {} : undefined, // Only enable TLS if set to "true"
  },
});
