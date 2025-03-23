import { Response, Request, NextFunction } from "express";
import {
  CodeHttpEnum,
  faliedMiddleware,
  LoggingService,
  routes,
} from "../shared";

const loggingService = new LoggingService();

export const originMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const url = req.baseUrl;
    const requestIp = req.ip;
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
      return next(
        faliedMiddleware(
          "Lo sentimos, no tienes permisos para acceder a este recurso. Por favor, ponte en contacto con el administrador del sistema si necesitas ayuda adicional.",
          CodeHttpEnum.forbidden
        )
      );

    if (origins && origins.length > 0) {
      const findOrigin = origins.find((origin: string) =>
        origin.includes(requestIp)
      );

      if (!findOrigin)
        return next(
          faliedMiddleware(
            "Lo sentimos, no tienes permisos para acceder a este recurso. Por favor, ponte en contacto con el administrador del sistema si necesitas ayuda adicional.",
            CodeHttpEnum.forbidden
          )
        );
    }

    next();
  } catch (err) {
    loggingService.error((err as any).message);
    return next(
      faliedMiddleware(
        "Lo sentimos, no tienes permisos para acceder a este recurso. Por favor, ponte en contacto con el administrador del sistema si necesitas ayuda adicional.",
        CodeHttpEnum.forbidden
      )
    );
  }
};

export default originMiddleware;
