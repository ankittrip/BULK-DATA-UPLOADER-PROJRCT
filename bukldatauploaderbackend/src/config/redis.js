import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) throw new Error("REDIS_URL not defined");

const redisClient = new Redis({
  host: "redis-17191.c322.us-east-1-2.ec2.redns.redis-cloud.com",
  port: 17191,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("connect", () => console.log("Connecting to Redis..."));
redisClient.on("ready", () => console.log("Redis client connected and ready."));
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("end", () => console.log("Redis connection closed."));

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
