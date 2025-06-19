//.....................................
import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    age: Number,
  },
  { timestamps: true }
);

// ✅ Named export
export const Record = mongoose.model("Record", recordSchema);
