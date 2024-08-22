import dotenv from "dotenv"
dotenv.config()

import errorMiddleware from "./middlewares/error.middleware"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import http from "http"
import { router } from "./router"
import mongoose from "mongoose"
import { Variables } from "./env/variables.env"
import path from "path"
import fileUpload from "express-fileupload"

export const app = express()

app.use(cors({
  credentials: true,
  origin: Variables.CLIENT_URL
}))
app.use(fileUpload())
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'static')))
app.use("/api", router)
app.use(errorMiddleware)

const server = http.createServer(app)
const PORT = Variables.PORT

const start = async () => {
  try {
    console.log(Variables.DATABASE_URL);

    await mongoose.connect(Variables.DATABASE_URL)

    server.listen(PORT, () => {
      console.log(`[INFO] server started in ${Variables.MODE} mode`);
    })
  } catch (e) {
    throw new Error(e as string)
  }
}

start()