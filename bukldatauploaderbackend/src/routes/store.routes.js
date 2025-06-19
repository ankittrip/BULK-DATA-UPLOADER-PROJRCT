import express from "express"
import { getStores } from "../controllers/store.controller.js"

const router = express.Router()

router.get("/", getStores)

export default router
