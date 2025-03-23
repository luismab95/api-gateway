import express, { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import colors from "colors";

import {
  ERR_502,
  CodeHttpEnum,
  config,
  errorHandler,
  RoutesInterface,
  RequestCountRateLimitInterface,
  routes,
} from "./shared";

const startServer = async () => {
  await runServer();
};

const runServer = () => {
  const { port, hostname } = config.server;

  const app = express();
  const corsOptions = {
    origin: "",
  };

  app.use(cors(corsOptions));
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );
  app.use(morgan("combined"));
  app.disable("x-powered-by");

  app.get(`/`, (_req: Request, res: Response) => {
    res.status(200).json({
      status: true,
      message: "Bienvenido/a, pero no hay nada que ver aquí!.",
    });
  });

  global.requestCounts = [];
  setInterval(() => {
    global.requestCounts.forEach((item: RequestCountRateLimitInterface) => {
      item.count = 0;
    });
  }, 60000);

  routes.forEach((item: RoutesInterface) => {
    const proxyOptions = {
      logger: console,
      target: item.target,
      changeOrigin: true,
      pathRewrite: {
        [`^${item.route}`]: "",
      },
      on: {
        econnreset: (err: any, _req: Request, res: Response, _target: any) => {
          res.status(CodeHttpEnum.internalServerError).json({
            status: false,
            message: ERR_502,
          });
        },
        error: (err: any, _req: Request, res: Response, _target: any) => {
          res.status(CodeHttpEnum.internalServerError).json({
            status: false,
            message: ERR_502,
          });
        },
      },
    };

    const middlewares = item.middlewares.map((middleware) => {
      const customMiddleware = require(`./middlewares/${middleware.name}`);
      return customMiddleware.default;
    });
    app.use(item.route, ...middlewares, createProxyMiddleware(proxyOptions));
  });

  app.use(errorHandler);

  process.env.TZ = "America/Guayaquil";
  app.listen(port, hostname, () => {
    console.info(colors.green.bold(`GATEWAY iniciado en ${hostname}:${port}`));
  });
};

startServer();

process.on("SIGINT", async () => {
  process.exit(0);
});
