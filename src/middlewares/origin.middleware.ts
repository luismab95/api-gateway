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

    if (!findRoute)
      return next(faliedMiddleware(ERR_403, CodeHttpEnum.forbidden));

    if (origins && origins.length > 0) {
      const findOrigin = origins.find((origin: string) =>
        origin.includes(requestIp)
      );

      if (!findOrigin)
        return next(faliedMiddleware(ERR_403, CodeHttpEnum.forbidden));
    }

    next();
  } catch (err) {
    logger.error((err as any).message);
    return next(faliedMiddleware(ERR_403, CodeHttpEnum.forbidden));
  }
};

export default originMiddleware;
