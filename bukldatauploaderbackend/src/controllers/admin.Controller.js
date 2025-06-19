import { JobHistory } from "../models/jobHistory.model.js"
import { FailedJob } from "../models/failedJob.model.js"
import { Store } from "../models/Store.model.js"
import { RetryHistory } from "../models/retryHistory.model.js"

export const getAllJobs = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit) || 10, 1), 100)
    const search = req.query.search?.trim() || ""

    const query = search
      ? {
          $or: [
            { fileName: { $regex: search, $options: "i" } },
            { jobId: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    const totalJobs = await JobHistory.countDocuments(query)
    const jobs = await JobHistory.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    res.json({ total: totalJobs, page, limit, jobs })
  } catch (err) {
    console.error("Error in getAllJobs:", err)
    res.status(500).json({ message: "Failed to get job history" })
  }
}

export const getAdminStats = async (req, res) => {
  try {
    const totalJobs = await JobHistory.countDocuments()
    const totalRecords = await Store.countDocuments()
    const failedJobs = await FailedJob.countDocuments()

    const failedAgg = await FailedJob.aggregate([{ $unwind: "$failedRecords" }, { $count: "count" }])
    const totalFailedRecords = failedAgg[0]?.count || 0

    res.json({
      totalJobs,
      totalRecords,
      failedJobs,
      totalFailedRecords,
    })
  } catch (err) {
    console.error("Error in getAdminStats:", err)
    res.status(500).json({ message: "Failed to get admin stats" })
  }
}

export const retryFailedRecords = async (req, res) => {
  try {
    const { jobId } = req.params

    const failedJob = await FailedJob.findOne({ jobId })
    if (!failedJob || !failedJob.failedRecords.length) {
      return res.status(404).json({ message: "No failed records found to retry." })
    }

    const MAX_RETRY = 5000
    const recordsToRetry = failedJob.failedRecords.slice(0, MAX_RETRY)

    const successRecords = []
    const failedAgain = []

    for (const recordObj of recordsToRetry) {
      try {
        successRecords.push(recordObj.record)
      } catch (err) {
        failedAgain.push({
          ...recordObj,
          retryCount: (recordObj.retryCount || 0) + 1,
          reason: err.message || "Retry failed",
        })
      }
    }

    let insertedCount = 0
    try {
      if (successRecords.length > 0) {
        await Store.insertMany(successRecords, { ordered: false })
        insertedCount = successRecords.length
      }
    } catch (insertErr) {
      console.error("Bulk insert error:", insertErr)
    }

    failedJob.failedRecords = failedJob.failedRecords.slice(MAX_RETRY)
    failedJob.failedRecords.push(...failedAgain)
    await failedJob.save()

    await RetryHistory.create({
      jobId,
      totalRetried: recordsToRetry.length,
      successCount: insertedCount,
      failedCount: failedAgain.length,
      retriedBy: "admin",
      notes: "Manual retry by admin",
    })

    res.status(200).json({
      message: "Retry process completed",
      retried: recordsToRetry.length,
      successCount: insertedCount,
      failedCount: failedAgain.length,
      remaining: failedJob.failedRecords.length,
    })
  } catch (err) {
    console.error("Error in retryFailedRecords:", err)
    res.status(500).json({ message: "Retry failed", error: err.message })
  }
}
