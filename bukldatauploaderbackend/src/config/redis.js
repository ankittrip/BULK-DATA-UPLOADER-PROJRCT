// config/redisClient.js
import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const isRedisCloud = process.env.REDIS_URL?.startsWith("rediss://");


const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: isRedisCloud,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Connecting to Redis...");
});

redisClient.on("ready", () => {
  console.log("Redis client connected and ready.");
});

redisClient.on("end", () => {
  console.log("Redis connection closed.");
});

// Connect Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    console.error("Redis connection failed:", err);
    throw err;
  }
};

export { connectRedis };
export default redisClient;
