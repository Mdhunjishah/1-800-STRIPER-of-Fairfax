import express from "express";
import dotenv from "dotenv"
import path from "path"
import cors from "cors"
import { connectDB } from "./config/db.js";
import estimateRoutes from "./routes/estimateRoutes.js"
import employeeRoutes from "./routes/employeeRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const __dirname = path.resolve()

if(process.env.NODE_ENV !== "production"){
    app.use(
        cors({
            origin: "http://localhost:5173",
        })
    )    
}
app.use(express.json())
app.use("/api/estimate", estimateRoutes)
app.use("/api/employee", employeeRoutes)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
    })    
} else {
    app.get("/", (req, res) => {
        res.send("Server is running")
    })  
}

app.listen(PORT, () => {
    connectDB()
    console.log('server started')
})
