import express from "express"
import { sendJobSummaryEmail } from "../controllers/email.controller.js"

const router = express.Router()

// Simple email format validator
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// POST /api/email/send-summary
router.post("/send-summary", async (req, res) => {
    console.log("📦 req.body = ", req.body);
    console.log("📦 HEADERS:", req.headers);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
  try {
    const { email, jobId, totalRecords, totalInserted, failedCount } = req.body

    // Check for required fields
    if (!email || !jobId || totalRecords == null || totalInserted == null || failedCount == null) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" })
    }

    // Call email controller to send the summary
    await sendJobSummaryEmail({ email, jobId, totalRecords, totalInserted, failedCount })

    return res.status(200).json({ message: `Summary email sent to ${email}` })
  } catch (error) {
    console.error("❌ Error sending email:", error)
    return res.status(500).json({
      message: "Failed to send email",
      error: error.message || "Internal Server Error",
    })
  }
})

export default router
