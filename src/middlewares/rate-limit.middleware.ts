import { NextFunction, Request, Response } from "express";
import {
  CodeHttpEnum,
  environment,
  ERR_429,
  ERR_504,
  faliedMiddleware,
  logger,
  RequestCountRateLimitI,
  services,
} from "../shared";

const { RATE_LIMIT } = environment;

export const rateLimitAndTimeoutMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const routes = await services();

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
      rateLimitMiddleware = RATE_LIMIT;

    const requestCounts: RequestCountRateLimitI[] = global.requestCounts;

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
    logger.error((err as any).message);
    return next(faliedMiddleware(ERR_429, CodeHttpEnum.rateLimit));
  }
};

export default rateLimitAndTimeoutMiddleware;
