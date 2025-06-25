import { FailedJob } from "../models/failedJob.model.js";
import { redisClient } from "../config/redis.js";

export const retryFailedJob = async (req, res) => {
  const { jobId } = req.params;

  // Validate jobId format if needed
  if (!jobId || typeof jobId !== 'string') {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    console.log("🔍 Searching FailedJob with jobId:", jobId);
    const failedJob = await FailedJob.findOne({ jobId });

    if (!failedJob) {
      console.warn(`⚠️ No failed job found for ID: ${jobId}`);
      return res.status(404).json({ message: "No failed job found for retry" });
    }

    if (!failedJob.failedRecords || failedJob.failedRecords.length === 0) {
      console.warn(`⚠️ No failed records found for job ID: ${jobId}`);
      return res.status(404).json({ message: "No failed records found for retry" });
    }

    // Prepare records for requeueing
    const retryRecords = failedJob.failedRecords.map((item) => 
      JSON.stringify({
        jobId,
        retry: true,
        record: item.record,
        timestamp: new Date().toISOString()  // Add timestamp for tracking
      })
    );

    // Verify Redis connection
    if (!redisClient.isReady) {
      console.log("⚡ Reconnecting to Redis...");
      await redisClient.connect();
    }

    // Push to Redis queue
    const pushedCount = await redisClient.lPush("csvQueue", retryRecords);
    
    // Update job logs
    failedJob.retryLogs.push({
      requeuedCount: pushedCount,
      status: "queued",
      timestamp: new Date()
    });

    await failedJob.save();

    console.log(`🔁 Retry triggered for Job ID: ${jobId}. Records re-queued: ${pushedCount}`);

    return res.status(200).json({
      success: true,
      message: `Retry triggered successfully for ${pushedCount} records.`,
      jobId,
      requeuedCount: pushedCount
    });

  } catch (error) {
    console.error("⛔ Error retrying failed job:", error);
    
    // Specific error handling
    if (error.name === 'RedisError') {
      return res.status(503).json({ 
        message: "Service temporarily unavailable. Please try again later." 
      });
    }

    return res.status(500).json({ 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};