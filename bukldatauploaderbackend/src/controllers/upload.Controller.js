// Correctly import uuidv4
import { v4 as uuidv4 } from "uuid"
import multer from "multer"
import { recordQueue } from "../queues/recordQueue.js"
import { JobHistory } from "../models/jobHistory.model.js"

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/") //  Use correct upload path
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.floor(Math.random() * 1000000)}.csv`)
  },
})

export const upload = multer({ storage })

export const uploadFileController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    const socketId = req.body.socketId
    if (!socketId) {
      console.warn("Missing socketId from frontend")
    } else {
      console.log("Received socketId:", socketId)
    }

    console.log("Uploaded File:", req.file)

    const jobId = uuidv4()
    const fileName = req.file.originalname

    //  Insert job entry in JobHistory
    await JobHistory.create({
      jobId,
      fileName,
      status: "queued",
      createdAt: new Date(),
      // uploadedBy: req.user?._id, // Optional
    })

    // Push job to Redis queue
    await recordQueue.add("process-file", {
      filePath: req.file.path,
      jobId,
      socketId, // Pass socketId for real-time updates
    })

    return res.status(200).json({
      success: true,
      message: "File uploaded and processing started",
      jobId,
    })
  } catch (err) {
    console.error("Upload error:", err.message)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}
