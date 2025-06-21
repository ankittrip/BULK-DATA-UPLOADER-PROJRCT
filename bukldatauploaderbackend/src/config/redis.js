// src/config/redis.js
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined in the environment variables");
}

// Use full URL to let Redis handle the auth
const redisClient = new Redis(redisUrl); 

redisClient.on("connect", () => {
  console.log("Connecting to Redis...");
});

redisClient.on("ready", () => {
  console.log("Redis client connected and ready.");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("end", () => {
  console.log("Redis connection closed.");
});

export const connectRedis = async () => {
  try {
    await redisClient.ping();
    console.log("Redis PING successful.");
  } catch (err) {
    console.error("Redis connection failed:", err);
    throw err;
  }
};

export default redisClient;
