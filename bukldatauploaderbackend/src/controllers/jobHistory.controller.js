import { JobHistory } from "../models/jobHistory.model.js"

export const getJobHistory = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const { userId, status } = req.query

    const query = {}
    if (userId) query.uploadedBy = userId
    if (status) query.status = status

    const total = await JobHistory.countDocuments(query)

    const jobs = await JobHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("jobId fileName status totalRecords successCount failureCount uploadedBy createdAt")

    res.status(200).json({
      total,
      page,
      jobs,
    })
  } catch (err) {
    console.error("Error fetching job history:", err)
    res.status(500).json({ message: "Error fetching job history" })
  }
}

export const getJobById = async (req, res) => {
  const jobId = req.params.jobId.trim()

  try {
    const job = await JobHistory.findOne({ jobId })

    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    res.status(200).json(job)
  } catch (err) {
    console.error("Error fetching job by ID:", err)
    res.status(500).json({ message: "Server error" })
  }
}
