import { createProxyMiddleware } from "http-proxy-middleware";
import {
  CodeHttpEnum,
  ERR_502,
  RequestCountRateLimitI,
  RouteI,
  logger,
  ProxyI,
  services,
} from "./../shared";
import { Request, Response } from "express";

export async function startProxy(): Promise<ProxyI[]> {
  global.requestCounts = [];
  setInterval(() => {
    global.requestCounts.forEach((item: RequestCountRateLimitI) => {
      item.count = 0;
    });
  }, 60000);

  const apis: ProxyI[] = [];

  const routes = await services();

  routes.forEach((item: RouteI) => {
    const proxyOptions = {
      logger: logger,
      target: item.target,
      changeOrigin: true,
      pathRewrite: {
        [`^${item.route}`]: "",
      },
      logLevel: "debug",
      on: {
        error: (err: any, _req: Request, res: Response) => {
          logger.error(`PROXY ERROR: ${err.message}`);
          res.status(CodeHttpEnum.internalServerError).json({
            status: false,
            message: ERR_502,
          });
        },
      },
    };

    const middlewares = item.middlewares.map((middleware) => {
      const customMiddleware = require(`./../middlewares/${middleware.name}`);
      return customMiddleware.default;
    });

    apis.push({
      route: item.route,
      middlewares: middlewares,
      proxy: createProxyMiddleware(proxyOptions),
    });
  });

  return apis;
}
