import { NextFunction, Request, Response } from "express";
import {
  CodeHttpEnum,
  config,
  ERR_429,
  ERR_504,
  faliedMiddleware,
  LoggingService,
  RequestCountRateLimitInterface,
  routes,
} from "../shared";

const { rateLimit } = config.server;
const loggingService = new LoggingService();

export const rateLimitAndTimeoutMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const findRoute = routes.find(
      (route) =>
        route.target.includes(req.baseUrl) &&
        route.middlewares.some(
          (middleware) => middleware.name === "rate-limit.middleware"
        )
    );

    let rateLimitMiddleware = findRoute?.middlewares.find(
      (middleware) => middleware.name === "rate-limit.middleware"
    )?.props.rateLimit;

    if (!rateLimitMiddleware || rateLimitMiddleware === 0)
      rateLimitMiddleware = rateLimit;

    const requestCounts: RequestCountRateLimitInterface[] =
      global.requestCounts;

    const existingRequest = requestCounts.find(
      (request) =>
        request.ip === req.ip &&
        request.originalUrl === req.originalUrl &&
        request.method === req.method
    );

    if (!existingRequest) {
      requestCounts.push({
        ip: req.ip,
        originalUrl: req.originalUrl,
        method: req.method,
        count: 1,
      });
    } else {
      existingRequest.count += 1;

      if (existingRequest.count > rateLimitMiddleware) {
        return next(faliedMiddleware(ERR_429, CodeHttpEnum.rateLimit));
      }
    }

    req.setTimeout(60000, () => {
      return next(faliedMiddleware(ERR_504, CodeHttpEnum.timeout));
    });

    return next();
  } catch (err) {
    loggingService.error((err as any).message);
    return next(faliedMiddleware(ERR_429, CodeHttpEnum.rateLimit));
  }
};

export default rateLimitAndTimeoutMiddleware;
