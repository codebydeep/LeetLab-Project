import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import executeCode from "../controllers/executeCode.controllers.js"

const executionRoute = express.Router()

executionRoute.post("/execute-code", authMiddleware, executeCode)

export default executionRoute