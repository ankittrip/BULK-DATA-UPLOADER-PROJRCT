import express from "express"
import { getJobHistory, getJobById } from "../controllers/jobHistory.controller.js"
import { retryFailedJob } from "../controllers/retry.controller.js"
import { downloadJobSummary } from "../controllers/jobDownload.controller.js"
import { getFailedRecords, downloadFailedRecords } from "../controllers/failedJob.controller.js"

const router = express.Router()

router.get("/", getJobHistory)
router.get("/:jobId", getJobById)
router.post("/:jobId/retry", retryFailedJob)
router.get("/:jobId/download", downloadJobSummary)
router.get("/:jobId/failed", getFailedRecords)
router.get("/:jobId/failed/download", downloadFailedRecords)

export default router
