"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface UseSocketOptions {
  onUploadProgress?: (data: any) => void
  onUploadComplete?: (data: any) => void
  onUploadError?: (data: any) => void
  onJobProgress?: (data: any) => void
  onJobCompleted?: (data: any) => void
}

export function useSocket(options: UseSocketOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: true,
    })

    socketInstance.on("connect", () => {
      console.log("🟢 Socket connected:", socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason)
      setIsConnected(false)
    })

    socketInstance.on("welcome", (message) => {
      console.log("👋 Welcome message:", message)
    })

    // Upload progress events
    socketInstance.on("upload-progress", (data) => {
      console.log("📊 Upload progress received:", data)
      options.onUploadProgress?.(data)
    })

    socketInstance.on("upload-complete", (data) => {
      console.log("✅ Upload complete received:", data)
      options.onUploadComplete?.(data)
    })

    socketInstance.on("upload-error", (data) => {
      console.log("❌ Upload error received:", data)
      options.onUploadError?.(data)
    })

    // Job progress events (alternative naming from backend)
    socketInstance.on("job:progress", (data) => {
      console.log("📊 Job progress received:", data)
      options.onJobProgress?.(data)
    })

    socketInstance.on("job:completed", (data) => {
      console.log("✅ Job completed received:", data)
      options.onJobCompleted?.(data)
    })

    setSocket(socketInstance)

    return () => {
      console.log("🧹 Cleaning up socket connection")
      socketInstance.disconnect()
    }
  }, [])

  return { socket, isConnected }
}
