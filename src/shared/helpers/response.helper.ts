import { NextFunction, Request, Response } from "express";
import { CodeHttpEnum } from "../enum/http-code.enum";
import { ERR_500, logger } from "../";

export class ErrorResponse extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  
  logger.error(error.stack);

  const statusCode = error.statusCode || CodeHttpEnum.internalServerError;
  const message = error.message || ERR_500;

  res.status(statusCode).json({
    status: false,
    message: message,
  });
};
