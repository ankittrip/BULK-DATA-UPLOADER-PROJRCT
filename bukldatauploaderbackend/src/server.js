import dotenv from "dotenv"
dotenv.config()

import http from "http"
import connectDB from "./config/db.js"
import app from "./app.js"
import { initSocket } from "./config/socket.js"
import  { connectRedis }  from "./config/redis.js"

const PORT = process.env.PORT || 5000

console.log("Starting server...")

const startServer = async () => {
  try {
    await connectDB()
    console.log("MongoDB connected")

    await connectRedis()
    console.log("Redis connected")

    const server = http.createServer(app)

    const io = initSocket(server)
    console.log("Socket.IO initialized")
    app.set("io", io)

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })

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
