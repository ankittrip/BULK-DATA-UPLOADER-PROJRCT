import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import uploadRoutes from "./routes/upload.Routes.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import path from "path"
import { fileURLToPath } from "url"
import jobRoutes from "./routes/job.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import storeRoutes from "./routes/store.routes.js"
import emailRoutes from "./routes/email.routes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/uploads", express.static(path.join(__dirname, "../uploads")))
app.use("/api/upload", uploadRoutes)
app.use("/api/jobs", jobRoutes)
app.use("/api/stores", storeRoutes)
app.use("/api/email", emailRoutes)
app.use("/admin", adminRoutes)

// Global error handler
app.use(errorHandler)

export default app
