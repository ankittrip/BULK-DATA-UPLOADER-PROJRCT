import { Server } from "socket.io"

let io

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: false,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  io.on("connection", (socket) => {
    

    socket.emit("welcome", {
      message: `Welcome socket ${socket.id}`,
      timestamp: new Date().toISOString(),
    })

    socket.on("join-room", (roomId) => {
      socket.join(roomId)
    
    })

    socket.on("disconnect", (reason) => {
      
    })

    socket.on("error", (error) => {
      
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    console.warn("Socket.IO not initialized, creating mock instance")
    // Return a mock Socket.IO instance for worker
    return {
      to: (socketId) => ({
        emit: (event, data) => {
          console.log(`📡 Mock Socket Emit [${socketId || "no-socket"}] ${event}:`, {
            jobId: data.jobId,
            status: data.status,
            progress: data.progress || 0,
            processedRecords: data.processedRecords || 0,
            successfulRecords: data.successfulRecords || 0,
            failedRecords: data.failedRecords || 0,
            message: data.message?.substring(0, 60) + "..." || "Processing...",
          })
        },
      }),
    }
  }
  return io
}
