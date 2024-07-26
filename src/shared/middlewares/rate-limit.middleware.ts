import { NextFunction, Request, Response } from "express";
import { config } from "../environments/load-env";
import { CodeHttpEnum } from "../enum/http-code.enum";
import { ERR_429, ERR_504 } from "../constants/messages";
import { LoggingService } from "../helpers/logging.helper";

const { rateLimit } = config.server;
const loggingService = new LoggingService();

const rateLimitAndTimeout = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip;
  try {
    (global as any).requestCounts[ip!] =
      ((global as any).requestCounts[ip!] || 0) + 1;

    if ((global as any).requestCounts[ip!] > rateLimit) {
      return res.status(CodeHttpEnum.rateLimit).json({
        data: "Has execido el máximo de peticiones por minuto.",
        message: ERR_429,
      });
    }

    req.setTimeout(60000, () => {
      res.status(CodeHttpEnum.timeout).json({
        data: "Tiempo de espera agotado",
        message: ERR_504,
      });
      (req as any).abort();
    });

    next();
  } catch (err) {
    loggingService.error((err as any).message);
    return res.status(CodeHttpEnum.rateLimit).json({
      data: "Has execido el máximo de peticiones por minuto.",
      message: ERR_429,
    });
  }
};

export { rateLimitAndTimeout as middlewareName };
