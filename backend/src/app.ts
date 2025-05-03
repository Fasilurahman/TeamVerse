import express from "express";
import dotenv from "dotenv";
import "reflect-metadata";
import { connectDB } from "./config/db";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import logger from "./infrastructure/logging/logger";
import { errorHandler } from "./middleware/errorHandler";
import routers from "./presentation/routes/routers";
import './cron/sprintCheck.cron';
import { generalLimiter } from "./middleware/rateLimiter";
dotenv.config();
connectDB();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = process.env.CLIENT_URL?.split(",") || [];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);



app.use(morgan("dev"));
app.use(morgan('combined',{
  stream: {
    write: (message)=> logger.info(message.trim()),
  }
}))

app.use('/', generalLimiter,routers)

app.use(errorHandler)

export default app;
