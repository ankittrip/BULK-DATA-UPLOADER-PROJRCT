import fs from "fs";
import csv from "csv-parser";
import { Store } from "../models/Store.model.js";
import { FailedJob } from "../models/failedJob.model.js";
import { getIO } from "../config/socket.js"; // for WebSocket

/**
 * Processes the records and stores success & failed entries.
 */
const processRecords = async (records, jobId) => {
  const failedRecords = [];
  let successCount = 0;

  for (const record of records) {
    try {
      await Store.create(record);
      successCount++;
    } catch (err) {
      failedRecords.push({
        record,
        reason: err.message,
      });
    }
  }

  if (failedRecords.length > 0) {
    await FailedJob.create({
      jobId,
      failedRecords,
    });
    console.log(`${failedRecords.length} records failed for job ${jobId}`);
  }

  console.log(`Processing complete. Inserted: ${successCount}, Failed: ${failedRecords.length}`);

  return { totalInserted: successCount, failedCount: failedRecords.length };
};

/**
 * Main function to handle the job file.
 */
export const handleJob = (job) => {
  const { filePath, jobId, socketId } = job;

  return new Promise((resolve, reject) => {
    const records = [];

    console.log(`🛠️ Starting job ${jobId} from file: ${filePath}`);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => records.push(data))
      .on("end", async () => {
        try {
          const result = await processRecords(records, jobId);

          // Emit socket event if socketId exists
          if (socketId) {
            try {
              const io = getIO();
              io.to(socketId).emit("job:completed", {
                jobId,
                ...result,
              });
              console.log("📡 WebSocket emitted to:", socketId);
            } catch (err) {
              console.warn("⚠️ WebSocket emit failed:", err.message);
            }
          }

          // Cleanup file
          fs.unlink(filePath, (err) => {
            if (err) console.error("❌ Temp file delete failed:", err.message);
            else console.log("🧹 Temp file cleaned up.");
          });

          resolve(); // Mark job done
        } catch (err) {
          console.error(`Error processing job ${jobId}:`, err.message);
          reject(err);
        }
      })
      .on("error", (err) => {
        console.error(`File read error for job ${jobId}:`, err.message);
        reject(err);
      });
  });
};









