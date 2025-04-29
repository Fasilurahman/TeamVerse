import { Response, Request, NextFunction } from "express";
import logger from "../infrastructure/logging/logger";
import { STATUS_CODES } from "../shared/constants/statusCodes";

class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
    }
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction){
    const statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal Server Error';
    
    logger.error(`Error: ${message}`,{
        stack: err.stack,
        method: req.method,
        url: req.originalUrl
    });

    return res.status(statusCode).json({
        success: false,
        message
    })
}

export function createError(message: string, statusCode: number){
    return new AppError(message, statusCode);
}