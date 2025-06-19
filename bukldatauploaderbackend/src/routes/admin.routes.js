import express from "express"
import { getAllJobs, retryFailedRecords, getAdminStats } from "../controllers/admin.Controller.js"

const router = express.Router()

router.get("/jobs", getAllJobs)
router.post("/jobs/:jobId/retry", retryFailedRecords)
router.get("/overview", getAdminStats)

export default router
