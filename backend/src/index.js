import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";

dotenv.config();

const port = process.env.PORT || 4000

const app = express()

app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Welcome to our LeetLab Project ❤️")
})

app.use("/api/v1/auth", authRoutes)
app.use("api/v1/problems", problemRoutes)

app.listen(port, () => {
    console.log(`LeetLab Server is running on Port: ${port}`);
})