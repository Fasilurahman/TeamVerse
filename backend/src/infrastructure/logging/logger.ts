import winston from "winston";
import 'winston-mongodb';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `[${timestamp}] ${level}: ${message}`
        : `[${timestamp}] ${level}: ${message}`;
    })
  );

  const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports:[
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat),
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname,'../../../logs/combined.log')
        }),
        new winston.transports.MongoDB({
            db: process.env.MONGODB_URL || "mongodb://localhost:27017/logs",
            collection: 'server_logs',
            level: 'error',
            options: {
                useUnifiedTopology: true
            },
        }),
    ]
  })

  export default logger;
  
