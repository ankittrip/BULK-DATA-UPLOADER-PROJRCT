import { FailedJob } from "../models/failedJob.model.js"

export const getFailedRecords = async (req, res) => {
  try {
    const jobId = String(req.params.jobId)
    const page = Math.max(Number.parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit) || 50, 1), 500)

    const failedJob = await FailedJob.findOne({ jobId })

    if (!failedJob || failedJob.failedRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No failed records found for this job",
        jobId,
      })
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRecords = failedJob.failedRecords.slice(startIndex, endIndex)

    return res.status(200).json({
      success: true,
      jobId: failedJob.jobId,
      totalFailedRecords: failedJob.failedRecords.length,
      page,
      limit,
      totalPages: Math.ceil(failedJob.failedRecords.length / limit),
      failedRecords: paginatedRecords.map((record, index) => ({
        index: startIndex + index + 1,
        record: record.record,
        reason: record.reason,
        retryCount: record.retryCount || 0,
        failedAt: record.failedAt || new Date(),
      })),
    })
  } catch (error) {
    console.error("Error in getFailedRecords:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

export const downloadFailedRecords = async (req, res) => {
  try {
    const jobId = String(req.params.jobId)
    const failedJob = await FailedJob.findOne({ jobId })

    if (!failedJob || failedJob.failedRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No failed records found",
      })
    }

    const csvHeaders = Object.keys(failedJob.failedRecords[0].record || {})
    const csvRows = [
      ["Row", "Error Reason", ...csvHeaders].join(","),
      ...failedJob.failedRecords.map((item, index) =>
        [
          index + 1,
          `"${item.reason || "Unknown error"}"`,
          ...csvHeaders.map((header) => {
            const value = item.record[header] || ""
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          }),
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename="failed-records-${jobId}.csv"`)
    res.send(csvContent)
  } catch (error) {
    console.error("Error downloading failed records:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate download",
    })
  }
}
