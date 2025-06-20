import express from "express"
import mainRouter from "./routes"
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express()

app.use(cors({
  origin: "http://localhost:5173", // React app URL
  credentials: true // Allow cookies/auth headers if using them
}));

app.use(express.json())

app.use("/api/v1",mainRouter)

app.listen(3000,()=>{
  console.log("listening on port 3000")
})