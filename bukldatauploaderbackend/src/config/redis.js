// src/config/redis.js
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),

    // TLS must be false or removed
    // tls: false ← OPTIONAL; default is false
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined, // Optional logic

    reconnectStrategy: (retries) => Math.min(retries * 100, 5000),
  },
});

// Event listeners

redisClient.on('connect', () => console.log('Connecting to Redis...'));
redisClient.on('ready', () => console.log(' Redis client connected and ready'));
redisClient.on('reconnecting', () => console.log('↻ Redis reconnecting...'));
redisClient.on('error', (err) => console.error(' Redis Client Error:', err));
redisClient.on('end', () => console.log(' Redis connection closed'));




const connectRedis = async () => {
  try {
    await redisClient.connect();
    await redisClient.ping();

    console.log('Redis PING successful');
  } catch (err) {
    console.error(' Redis connection failed:', err);

    console.log('🩺 Redis PING successful');
  }

};

export { redisClient, connectRedis };
