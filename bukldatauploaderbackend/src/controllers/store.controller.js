import { Store } from "../models/Store.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const getStores = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const search = req.query.search || ""

  const query = {
    $or: [
      { storeName: new RegExp(search, "i") },
      { cityName: new RegExp(search, "i") },
      { regionName: new RegExp(search, "i") },
      { retailerName: new RegExp(search, "i") },
      { storeType: new RegExp(search, "i") },
    ],
  }

  const total = await Store.countDocuments(query)
  const stores = await Store.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    stores,
  })
})
