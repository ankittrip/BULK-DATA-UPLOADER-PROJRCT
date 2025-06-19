import { createClient } from "redis"

// Create Redis client
export const redisClient = createClient({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  retry_strategy: (options) => {
    if (options.error && options.error.code === "ECONNREFUSED") {
      
      return new Error("Redis server connection refused")
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      
      return new Error("Retry time exhausted")
    }
    if (options.attempt > 10) {
    
      return undefined
    }
    return Math.min(options.attempt * 100, 3000)
  },
})

// Handle errors
redisClient.on("error", (err) => {
  
})

redisClient.on("connect", () => {
  
})

redisClient.on("ready", () => {
  
})

redisClient.on("end", () => {
  
})

// Connect to Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect()
    }
  } catch (error) {
    console.error("Failed to connect to Redis:", error)
    throw error
  }
}

export { connectRedis }
export default redisClient
