import mongoose from "mongoose"

const jobHistorySchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  totalRecords: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  successfulRecords: {
    type: Number,
    default: function () {
      return this.successCount
    },
  },
  failedRecords: {
    type: Number,
    default: function () {
      return this.failureCount
    },
  },
  status: {
    type: String,
    enum: ["pending", "processing", "queued", "completed", "failed"],
    default: "pending",
  },
  startedAt: { type: Date },
  completedAt: { type: Date },
  failedAt: { type: Date },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

jobHistorySchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  this.successfulRecords = this.successCount
  this.failedRecords = this.failureCount
  next()
})

jobHistorySchema.virtual("processedRecords").get(function () {
  return this.successCount + this.failureCount
})

jobHistorySchema.set("toJSON", { virtuals: true })
jobHistorySchema.set("toObject", { virtuals: true })

export const JobHistory = mongoose.model("JobHistory", jobHistorySchema)
