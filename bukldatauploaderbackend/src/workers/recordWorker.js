import { Worker } from "bullmq"
import dotenv from "dotenv"
import mongoose from "mongoose"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from multiple possible locations
const envPaths = [
  path.join(__dirname, "../../.env"),
  path.join(process.cwd(), ".env"),
  ".env"
]

let envLoaded = false
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading .env from: ${envPath}`)
    dotenv.config({ path: envPath })
    envLoaded = true
    break
  }
}

if (!envLoaded) {
  console.warn("No .env file found, using system environment variables")
  dotenv.config()
}

// Verify critical environment variables
console.log("🔧 Worker Environment Check:")
console.log(`MONGODB_URL: ${process.env.MONGODB_URL ? "Loaded" : "Missing"}`)
console.log(`REDIS_HOST: ${process.env.REDIS_HOST || "127.0.0.1"}`)
console.log(`REDIS_PORT: ${process.env.REDIS_PORT || 6379}`)
console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? "Loaded" : "Missing"}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV || "development"}`)

// Exit if MongoDB URL is missing
if (!process.env.MONGODB_URL) {
  console.error("MONGODB_URL environment variable is not set!")
  console.error("Make sure your .env file contains:")
  console.error("MONGODB_URL=mongodb+srv://ankittripathi559:bulk1234@cluster0.whoahv0.mongodb.net/bulkUploadDB")
  process.exit(1)
}

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number.parseInt(process.env.REDIS_PORT) || 6379,
}

const connectMongo = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL
    
    // Add database name if not present
    const connectionString = mongoUri.includes("bulkUploadDB") 
      ? mongoUri 
      : mongoUri.endsWith("/") 
        ? `${mongoUri}bulkUploadDB`
        : `${mongoUri}/bulkUploadDB`

    console.log("Connecting to MongoDB...")
    console.log(`Connection: ${connectionString.replace(/\/\/.*:.*@/, "//***:***@")}`)
    
    await mongoose.connect(connectionString, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    })
    
    console.log("MongoDB connected in worker")
    console.log(`Database: ${mongoose.connection.name}`)
  } catch (err) {
    console.error("MongoDB connection error in worker:", err.message)
    
    if (err.message.includes("authentication failed")) {
      console.error("Check your MongoDB username and password")
    } else if (err.message.includes("network")) {
      console.error("Check your internet connection and MongoDB Atlas IP whitelist")
    }
    
    process.exit(1)
  }
}

// Connect to MongoDB before starting worker
await connectMongo()

// Import other modules after environment is loaded
import { getIO } from "../config/socket.js"
import { processFile } from "../services/processFile.js"
import { JobHistory } from "../models/jobHistory.model.js"
import {  sendJobSummaryEmail } from "../utils/emailSender.js"
import { JOB_STATUS } from "../constants.js"

const worker = new Worker(
  "record-queue",
  async (job) => {
    const {
      filePath,
      jobId,
      uploadedByEmail = "admin@example.com",
      socketId,
      notifyByEmail = true,
      fileName,
      fileSize,
    } = job.data

    console.log(`Worker received job ${job.id} | JobID: ${jobId} | File: ${fileName}`)

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    try {
      // Update job status to processing
      const updatedJob = await JobHistory.findOneAndUpdate(
        { jobId },
        {
          status: JOB_STATUS.PROCESSING,
          startedAt: new Date(),
        },
        { new: true },
      )

      if (!updatedJob) {
        throw new Error(`Job ${jobId} not found in database`)
      }

//       // Send job started email if enabled
//       if (notifyByEmail && uploadedByEmail && completedJob.emailNotifications?.onComplete) {
//   try {
//     await sendJobCompletedEmail(uploadedByEmail, {
//       jobId: completedJob.jobId,
//       fileName: completedJob.fileName,
//       totalRecords: completedJob.totalRecords,
//       successCount: completedJob.successCount,
//       failedCount: completedJob.failureCount,
//       successRate: completedJob.successRate,
//       completedAt: completedJob.completedAt,
//       duration: completedJob.duration,
//     })
//     emailSent = true
//     console.log(`Completion email sent to ${uploadedByEmail}`)
//   } catch (emailError) {
//     console.error(`Completion email failed:`, emailError.message)
//   }
// }


      let io
      try {
        io = getIO()
      } catch (ioError) {
        console.warn("Socket.IO not available:", ioError.message)
      }

      // Emit initial processing status
      if (socketId && io) {
        io.to(socketId).emit("upload-progress", {
          jobId,
          status: "processing",
          message: "Processing started...",
          processedRecords: 0,
          successfulRecords: 0,
          failedRecords: 0,
          progress: 0,
        })
      }

      const startTime = Date.now()

      // Process the file
      const result = await processFile(filePath, jobId, (progress) => {
        const elapsedTime = (Date.now() - startTime) / 1000
        const speed = elapsedTime > 0 ? Math.round((progress.inserted + progress.failed) / elapsedTime) : 0

        if (socketId && io) {
          io.to(socketId).emit("upload-progress", {
            jobId,
            status: "processing",
            totalRecords: progress.totalRecords || 0,
            processedRecords: progress.inserted + progress.failed,
            successfulRecords: progress.inserted,
            failedRecords: progress.failed,
            progress: progress.progress,
            processingSpeed: speed,
            batchInfo: {
              totalBatches: Math.ceil((progress.inserted + progress.failed) / 1000),
              completedBatches: Math.floor((progress.inserted + progress.failed) / 1000),
              currentBatch: Math.floor((progress.inserted + progress.failed) / 1000) + 1,
              batchSize: 1000,
            },
          })
        }
      })

      const { totalRecords, totalInserted, failedCount } = result

      // Update job as completed
      const completedJob = await JobHistory.findOneAndUpdate(
        { jobId },
        {
          $set: {
            status: JOB_STATUS.COMPLETED,
            totalRecords,
            successCount: totalInserted,
            failureCount: failedCount,
            completedAt: new Date(),
            progress: 100,
          },
        },
        { new: true },
      )

      console.log(`JobHistory updated for ${jobId}:`, {
        totalRecords,
        successCount: totalInserted,
        failureCount: failedCount,
        successRate: completedJob.successRate,
      })

      // Send completion email if enabled
      // Send completion email if enabled
let emailSent = false
if (notifyByEmail && uploadedByEmail && completedJob.emailNotifications?.onComplete) {
  try {
    await sendJobCompletedEmail(uploadedByEmail, {
      jobId: completedJob.jobId,
      fileName: completedJob.fileName,
      totalRecords: completedJob.totalRecords,
      successCount: completedJob.successCount,
      failedCount: completedJob.failureCount,
      successRate: completedJob.successRate,
      completedAt: completedJob.completedAt,
      duration: completedJob.duration,
    })
    emailSent = true
    console.log(`Completion email sent to ${uploadedByEmail}`)

    // ✅ Send summary email (with optional failed-records CSV)
    const { sendJobSummaryEmail } = await import("../utils/sendJobSummary.js")

    const failedRecordsPath = path.resolve(__dirname, `../temp/failed-${completedJob.jobId}.csv`)
    const hasAttachment = fs.existsSync(failedRecordsPath)

    await sendJobSummaryEmail({
      email: uploadedByEmail,
      jobId: completedJob.jobId,
      totalRecords: completedJob.totalRecords,
      totalInserted: completedJob.successCount,
      failedCount: completedJob.failureCount,
      attachmentPath: hasAttachment ? failedRecordsPath : undefined,
    })

    console.log(`✅ Summary email sent to ${uploadedByEmail}`)

    // Optional: cleanup failed-records CSV after sending
    if (hasAttachment) {
      fs.unlinkSync(failedRecordsPath)
      console.log(`🧹 Deleted failed-records CSV: ${failedRecordsPath}`)
    }
  } catch (emailError) {
    console.error(`Completion/summary email failed:`, emailError.message)
  }
}


      // Emit completion status
      if (socketId && io) {
        io.to(socketId).emit("upload-complete", {
          jobId,
          status: "completed",
          totalRecords,
          successfulRecords: totalInserted,
          failedRecords: failedCount,
          processedRecords: totalRecords,
          progress: 100,
          successRate: completedJob.successRate,
          message: "Processing completed successfully!",
          emailSent,
        })
        console.log(`📡 upload-complete emitted to ${socketId}`)
      }

      // Cleanup uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`File deleted: ${filePath}`)
      }

      return result
    } catch (err) {
      console.error("Worker Error:", err.message)

      // Update job as failed
      const failedJob = await JobHistory.findOneAndUpdate(
        { jobId },
        {
          status: JOB_STATUS.FAILED,
          failedAt: new Date(),
          errorMessage: err.message,
        },
        { new: true },
      )

      // Send failure email if enabled
      let emailSent = false
      if (notifyByEmail && uploadedByEmail && failedJob?.emailNotifications?.onFailure) {
        try {
          await sendJobFailedEmail(uploadedByEmail, {
            jobId: failedJob.jobId,
            fileName: failedJob.fileName,
            failedAt: failedJob.failedAt,
            errorMessage: failedJob.errorMessage,
          })
          emailSent = true
          console.log(`Failure email sent to ${uploadedByEmail}`)
        } catch (emailError) {
          console.error(`Failure email failed:`, emailError.message)
        }
      }

      // Emit error status
      let io
      try {
        io = getIO()
        if (socketId && io) {
          io.to(socketId).emit("upload-error", {
            jobId,
            status: "failed",
            message: err.message,
            error: err.message,
            emailSent,
          })
          console.log(`upload-error emitted to ${socketId}`)
        }
      } catch (ioError) {
        console.warn("Could not emit error event:", ioError.message)
      }

      // Cleanup file on error
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
          console.log(`File cleaned up after error: ${filePath}`)
        } catch (cleanupError) {
          console.error(`Failed to cleanup file:`, cleanupError.message)
        }
      }

      throw err
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
    removeOnComplete: 10,
    removeOnFail: 5,
  },
)

worker.on("completed", (job) => {
  console.log(`Job ${job.data.jobId} completed successfully`)
})

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.data?.jobId} failed:`, err.message)
})

worker.on("error", (err) => {
  console.error("Worker error:", err)
})

worker.on("stalled", (job) => {
  console.warn(`Job ${job?.data?.jobId} stalled`)
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down worker gracefully...")
  await worker.close()
  await mongoose.connection.close()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down worker gracefully...")
  await worker.close()
  await mongoose.connection.close()
  process.exit(0)
})

console.log(" BullMQ Worker started and waiting for jobs...")
console.log(` Connected to Redis: ${redisConnection.host}:${redisConnection.port}`)
console.log(` Connected to MongoDB: ${process.env.MONGODB_URL ? "" : ""}`)

export default worker

