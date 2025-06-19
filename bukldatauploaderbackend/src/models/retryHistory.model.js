import mongoose from "mongoose"

const retryHistorySchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true },
    retriedAt: { type: Date, default: Date.now },
    totalRetried: { type: Number, required: true },
    successCount: { type: Number, required: true },
    failedCount: { type: Number, required: true },
    retriedBy: { type: String, default: "admin" },
    notes: { type: String, default: "Manual retry" },
  },
  { timestamps: true },
)

export const RetryHistory = mongoose.model("RetryHistory", retryHistorySchema)
