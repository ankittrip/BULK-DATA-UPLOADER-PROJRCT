import { Queue } from "bullmq"
import dotenv from "dotenv"
dotenv.config()

const connection = {
  host: "127.0.0.1",
  port: 6379,
}

export const recordQueue = new Queue("record-queue", { connection })
