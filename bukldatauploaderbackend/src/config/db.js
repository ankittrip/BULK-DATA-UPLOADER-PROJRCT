import mongoose from "mongoose"
import { DB_name } from "../constants.js"

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URL

  if (!MONGODB_URI) {
    console.error("MONGODB_URL not found in .env file")
    process.exit(1)
  }

  try {
    const connectionInstance = await mongoose.connect(MONGODB_URI, {
      dbName: DB_name || "defaultDB",
    })

    console.log(`MongoDB connected! DB host: ${connectionInstance.connection.host}`)
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message)
    process.exit(1)
  }
}

export default connectDB
