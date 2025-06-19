import { JobHistory } from "../models/jobHistory.model.js"
import { FailedJob } from "../models/failedJob.model.js"
import { Parser } from "json2csv"

export const downloadJobSummary = async (req, res) => {
  const { jobId } = req.params
  const format = req.query.format || "json"

  try {
    const job = await JobHistory.findOne({ jobId })
    const failed = await FailedJob.findOne({ jobId })

    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    const failedRecords = Array.isArray(failed?.failedRecords) ? failed.failedRecords : []

    const summary = {
      jobId,
      fileName: job.fileName,
      status: job.status,
      totalRecords: job.totalRecords,
      successCount: job.successCount,
      failureCount: job.failureCount,
      failedRecords,
    }

    if (format === "csv") {
      if (failedRecords.length === 0) {
        return res.status(404).json({ message: "No failed records found to export" })
      }

      const flatRecords = failedRecords.map(({ record, reason }) => ({
        ...record,
        reason,
      }))

      try {
        const parser = new Parser()
        const csv = parser.parse(flatRecords)

        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", `attachment; filename="failed-summary-${jobId}.csv"`)
        res.setHeader("Cache-Control", "no-store")

        return res.status(200).send(csv)
      } catch (csvError) {
        console.error("CSV generation error:", csvError.message)
        return res.status(500).json({ message: "Failed to generate CSV", error: csvError.message })
      }
    }

    return res.status(200).json(summary)
  } catch (err) {
    console.error("Error in downloadJobSummary:", err)
    return res.status(500).json({ message: "Download failed", error: err.message })
  }
}
