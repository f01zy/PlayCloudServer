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

const app = express()

app.use(fileUpload())
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: Variables.CLIENT_URL
}))
app.use(express.static(path.join(__dirname, 'public')))
app.use("/api", router)
app.use(errorMiddleware)

const server = http.createServer(app)
const PORT = Variables.PORT

const start = async () => {
  try {
    await mongoose.connect(Variables.DATABASE_URL)

    server.listen(PORT, () => {
      console.log(`[LOG] PlayCloud started in ${Variables.MODE} mode`);
    })
  } catch (e) {
    console.log(e);
  }
}

start()

export default app