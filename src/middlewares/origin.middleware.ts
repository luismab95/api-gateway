import { Response, Request, NextFunction } from "express";
import {
  CodeHttpEnum,
  faliedMiddleware,
  services,
  logger,
  ERR_403,
} from "../shared";

export const originMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const url = req.baseUrl;
    const requestIp = req.ip;

    const routes = await services();

    const findRoute = routes.find(
      (route) =>
        route.target.includes(url) &&
        route.middlewares.some(
          (middleware) => middleware.name === "origin.middleware"
        )
    );
    const origins = findRoute?.middlewares.find(
      (middleware) => middleware.name === "origin.middleware"
    )?.props.origins;

    if (!findRoute) return next(errorResponse);

    if (origins && origins.length > 0) {
      const findOrigin = origins.find((origin: string) =>
        origin.includes(requestIp)
      );

      if (!findOrigin) return next(errorResponse);
    }

    next();
  } catch (err) {
    logger.error((err as any).message);
    return next(errorResponse);
  }
};

const errorResponse = faliedMiddleware(ERR_403, CodeHttpEnum.forbidden);

export default originMiddleware;
