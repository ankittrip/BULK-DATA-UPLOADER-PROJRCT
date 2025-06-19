import express from "express"
import { uploadFileController } from "../controllers/upload.Controller.js"
import { upload } from "../middlewares/uploadMiddleware.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const router = express.Router()

router.post("/", upload.single("file"), asyncHandler(uploadFileController))

export default router
