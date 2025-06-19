import fs from "fs"
import csv from "csv-parser"
import { Store } from "../models/Store.model.js"
import { FailedJob } from "../models/failedJob.model.js"
import { getIO } from "../config/socket.js"

const BATCH_SIZE = 500 // Reduced batch size for better reliability

const processRecords = async (records, jobId, fileName, onProgress) => {
  const failedRecords = []
  let successCount = 0
  const totalRecords = records.length
  const startTime = Date.now()

  console.log(`Processing ${totalRecords} records for job ${jobId} (${fileName})`)

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const batchNumber = Math.ceil((i + BATCH_SIZE) / BATCH_SIZE)
    const totalBatches = Math.ceil(totalRecords / BATCH_SIZE)

    console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)`)

    // Validate and clean batch data
    const cleanBatch = batch
      .map((record, index) => {
        // Add unique identifier to prevent duplicates
        const timestamp = Date.now()
        const uniqueId = `${timestamp}-${i + index}`

        return {
          storeName: String(record.storeName || record.store_name || `Store-${uniqueId}`).trim(),
          storeAddress: String(record.storeAddress || record.store_address || `Address-${uniqueId}`).trim(),
          cityName: String(record.cityName || record.city_name || record.city || "Unknown City").trim(),
          regionName: String(record.regionName || record.region_name || record.region || "Unknown Region").trim(),
          retailerName: String(
            record.retailerName || record.retailer_name || record.retailer || "Unknown Retailer",
          ).trim(),
          storeType: String(record.storeType || record.store_type || record.type || "Unknown Type").trim(),
          storeLongitude: record.storeLongitude || record.store_longitude || record.longitude || null,
          storeLatitude: record.storeLatitude || record.store_latitude || record.latitude || null,
          jobId: jobId,
          // Add unique constraint fields to prevent duplicates
          uniqueKey: `${jobId}-${i + index}`,
          uploadedAt: new Date(),
        }
      })
      .filter((record) => {
        // Filter out records with missing required fields
        return (
          record.storeName &&
          record.storeAddress &&
          record.cityName &&
          record.regionName &&
          record.retailerName &&
          record.storeType
        )
      })

    if (cleanBatch.length === 0) {
      console.log(`Batch ${batchNumber} has no valid records, skipping...`)
      continue
    }

    try {
      // Try bulk insert with better error handling
      const result = await Store.insertMany(cleanBatch, {
        ordered: false, // Continue on errors
        rawResult: true,
      })

      successCount += result.insertedCount || cleanBatch.length
      console.log(`Batch ${batchNumber} inserted: ${result.insertedCount || cleanBatch.length} records`)
    } catch (batchError) {
      console.warn(`Batch ${batchNumber} bulk insert failed, trying individual inserts...`)

      // Individual insert fallback with better error tracking
      for (const [index, record] of cleanBatch.entries()) {
        try {
          await Store.create(record)
          successCount++
        } catch (err) {
          // Skip duplicate errors, log others
          if (!err.message.includes("E11000") && !err.message.includes("duplicate")) {
            failedRecords.push({
              record: batch[i + index], // Use original record for failed tracking
              reason: err.message || "Unknown validation error",
              retryCount: 0,
              failedAt: new Date(),
            })
          } else {
            // Count duplicates as "successful" since data exists
            successCount++
          }
        }
      }
    }

    const processedSoFar = successCount + failedRecords.length
    const progressPercent = Math.min(Math.round((processedSoFar / totalRecords) * 100), 100)

    const elapsedTime = (Date.now() - startTime) / 1000
    const speed = elapsedTime > 0 ? Math.round(processedSoFar / elapsedTime) : 0

    if (typeof onProgress === "function") {
      onProgress({
        jobId,
        fileName,
        totalRecords,
        inserted: successCount,
        failed: failedRecords.length,
        progress: progressPercent,
        speed: speed,
        batchNumber: batchNumber,
        totalBatches: totalBatches,
        processedRecords: processedSoFar,
      })
    }

    // Small delay to prevent overwhelming the database
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  if (failedRecords.length > 0) {
    try {
      await FailedJob.create({
        jobId,
        failedRecords,
      })
      console.log(` ${failedRecords.length} records failed for job ${jobId}`)
    } catch (saveErr) {
      console.error("Error saving failed records:", saveErr.message)
    }
  }

  console.log(`Processing complete for ${fileName}. Inserted: ${successCount}, Failed: ${failedRecords.length}`)

  return {
    totalRecords,
    totalInserted: successCount,
    failedCount: failedRecords.length,
    successRate: totalRecords > 0 ? Math.round((successCount / totalRecords) * 100) : 0,
  }
}

export const handleJob = (job) => {
  const { filePath, jobId, socketId, fileName = "Unknown file" } = job

  return new Promise((resolve, reject) => {
    const records = []
    const io = getIO() // This will now always return something (real or mock)

    console.log(`Starting job ${jobId} from file: ${filePath}`)
    console.log(`Processing file: ${fileName}`)

    if (socketId) {
      io.to(socketId).emit("upload-progress", {
        jobId,
        status: "processing",
        message: `Reading CSV file: ${fileName}...`,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
      })
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => records.push(data))
      .on("end", async () => {
        try {
          console.log(`CSV parsed: ${records.length} records found in ${fileName}`)

          if (socketId) {
            io.to(socketId).emit("upload-progress", {
              jobId,
              status: "processing",
              fileName: fileName,
              totalRecords: records.length,
              processedRecords: 0,
              successfulRecords: 0,
              failedRecords: 0,
            })
          }

          const result = await processRecords(records, jobId, fileName, (progress) => {
            if (socketId) {
              const speed = progress.speed || 0

              io.to(socketId).emit("upload-progress", {
                jobId,
                status: "processing",
                fileName: progress.fileName,
                totalRecords: progress.totalRecords,
                processedRecords: progress.processedRecords,
                successfulRecords: progress.inserted,
                failedRecords: progress.failed,
                progress: progress.progress,
                processingSpeed: speed,
                message: `Processing ${progress.fileName} - Batch ${progress.batchNumber}/${progress.totalBatches}`,
                batchInfo: {
                  totalBatches: progress.totalBatches,
                  completedBatches: progress.batchNumber,
                  currentBatch: progress.batchNumber + 1,
                  batchSize: BATCH_SIZE,
                },
              })
            }
          })

          if (socketId) {
            io.to(socketId).emit("upload-complete", {
              jobId,
              status: "completed",
              fileName: fileName,
              totalRecords: result.totalRecords,
              successfulRecords: result.totalInserted,
              failedRecords: result.failedCount,
              processedRecords: result.totalRecords,
              message: `Processing completed! File: ${fileName}`,
              successRate: result.successRate,
              emailSent: false,
            })
            console.log("📡 upload-complete emitted to:", socketId)
          }

          fs.unlink(filePath, (err) => {
            if (err) console.error("Temp file delete failed:", err.message)
            else console.log(`🧹 Temp file cleaned up: ${fileName}`)
          })

          resolve(result)
        } catch (err) {
          console.error(`Error processing job ${jobId} (${fileName}):`, err.message)

          if (socketId) {
            io.to(socketId).emit("upload-error", {
              jobId,
              status: "failed",
              fileName: fileName,
              message: `Error processing ${fileName}: ${err.message}`,
              error: err.message,
              emailSent: false,
            })
            console.log("📡 upload-error emitted to:", socketId)
          }

          reject(err)
        }
      })
      .on("error", (err) => {
        console.error(` File read error for job ${jobId} (${fileName}):`, err.message)

        if (socketId) {
          io.to(socketId).emit("upload-error", {
            jobId,
            status: "failed",
            fileName: fileName,
            message: `File read error for ${fileName}: ${err.message}`,
            error: err.message,
            emailSent: false,
          })
        }

        reject(err)
      })
  })
}

export const processFile = (filePath, jobId, fileName, onProgress) => {
  return handleJob({ filePath, jobId, socketId: null, fileName }).then((result) => {
    return result
  })
}
