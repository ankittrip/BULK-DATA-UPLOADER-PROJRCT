import { FailedJob } from "../models/failedJob.model.js"
import redisClient from "../config/redis.js"

export const retryFailedJob = async (req, res) => {
  const { jobId } = req.params

  try {
    console.log("🔍 Searching FailedJob with jobId:", jobId)
    const failedJob = await FailedJob.findOne({ jobId })

    if (!failedJob) {

      return res.status(404).json({ message: "No failed job found for retry" })
    }

    if (!failedJob.failedRecords || failedJob.failedRecords.length === 0) {
      
      return res.status(404).json({ message: "No failed records found for retry" })
    }

    const retryRecords = failedJob.failedRecords.map((item) =>
      JSON.stringify({
        jobId,
        retry: true,
        record: item.record,
      }),
    )

    await redisClient.lPush("csvQueue", ...retryRecords)

    failedJob.retryLogs.push({
      requeuedCount: retryRecords.length,
      status: "queued",
    })

    await failedJob.save()

    console.log(`🔁 Retry triggered for Job ID: ${jobId}. Records re-queued: ${retryRecords.length}`)

    return res.status(200).json({
      message: `Retry triggered successfully for ${retryRecords.length} records.`,
    })
  } catch (error) {
    console.error("Error retrying failed job:", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}
