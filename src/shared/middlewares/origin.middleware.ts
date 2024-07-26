import { Response, Request, NextFunction } from "express";
import { CodeHttpEnum } from "../enum/http-code.enum";
import { ERR_403 } from "../constants/messages";
import { LoggingService } from "../helpers/logging.helper";
import { getRoutes } from "./../../config/routes";

const loggingService = new LoggingService();

const originMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestIp = req.ip;
  const url = req.baseUrl;
  try {
    const routes = await getRoutes();
    const findRoute = routes.find((route) => route.target.includes(url));

    if (findRoute === undefined) return forbiddenResponse(res);

    if (findRoute.origins.length > 0) {
      const findOrigin = findRoute.origins?.find((origin) =>
        origin.includes(requestIp!)
      );

      if (findOrigin === undefined) return forbiddenResponse(res);
    }

    next();
  } catch (err) {
    loggingService.error((err as any).message);
    return forbiddenResponse(res);
  }
};

const forbiddenResponse = async (res: Response) => {
  return res.status(CodeHttpEnum.forbidden).json({
    data: "Lo sentimos, no tienes permisos para acceder a este recurso. Por favor, ponte en contacto con el administrador del sistema si necesitas ayuda adicional.",
    message: ERR_403,
  });
};
export { originMiddleware as middlewareName };
