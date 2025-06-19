import dotenv from "dotenv"
import http from "http"
import connectDB from "./config/db.js"
import app from "./app.js"
import { initSocket } from "./config/socket.js"
import { connectRedis } from "./config/redis.js"

dotenv.config()

const PORT = process.env.PORT || 5000

console.log("Starting server...")

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB()
    console.log("MongoDB connected")

    // Connect to Redis
    await connectRedis()
    console.log("Redis connected")

    // Create HTTP server
    const server = http.createServer(app)

    // Initialize Socket.IO
    const io = initSocket(server)
    console.log("Socket.IO initialized")
    app.set("io", io)

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully")
      server.close(() => {
        console.log("Process terminated")
      })
    })
  } catch (err) {
    console.error(" Startup failed:", err.message)
    process.exit(1)
  }
}

startServer()
