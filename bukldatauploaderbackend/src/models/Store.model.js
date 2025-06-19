import mongoose from "mongoose"

const storeSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    storeAddress: {
      type: String,
      required: true,
      trim: true,
    },
    cityName: {
      type: String,
      required: true,
      trim: true,
    },
    regionName: {
      type: String,
      required: true,
      trim: true,
    },
    retailerName: {
      type: String,
      required: true,
      trim: true,
    },
    storeType: {
      type: String,
      required: true,
      trim: true,
    },
    storeLongitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    storeLatitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    errorResponse: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

storeSchema.index({ storeName: 1, storeAddress: 1 }, { unique: true })
storeSchema.index({ cityName: 1 })
storeSchema.index({ regionName: 1 })
storeSchema.index({ retailerName: 1 })

export const Store = mongoose.models.Store || mongoose.model("Store", storeSchema)
