import mongoose from "mongoose"

const failedRecordSchema = new mongoose.Schema({
  record: {
    type: Object,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  failedAt: {
    type: Date,
    default: Date.now,
  },
})

const retryLogSchema = new mongoose.Schema({
  requeuedCount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["queued", "processed", "failed"],
    default: "queued",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const failedJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    failedRecords: {
      type: [failedRecordSchema],
      required: true,
      default: [],
    },
    retryLogs: {
      type: [retryLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)


failedJobSchema.index({ createdAt: -1 })

export const FailedJob = mongoose.model("FailedJob", failedJobSchema)
