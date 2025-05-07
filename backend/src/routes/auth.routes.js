import express from "express"
import { check, login, logout, register } from "../controllers/auth.controllers.js"

const authRoutes = express.Router()

authRoutes.post("/register", register)
authRoutes.get("/login", login)
authRoutes.post("/logout", logout)
authRoutes.post("/check", check)

export default authRoutes;