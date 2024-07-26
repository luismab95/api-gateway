import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { config } from "./shared/environments/load-env";
import { ERR_404, OK_200 } from "./shared/constants/messages";
import { CodeHttpEnum } from "./shared/enum/http-code.enum";
import { middlewareName as rateLimitAndTimeout } from "./shared/middlewares/rate-limit.middleware";
import { RoutesInterface } from "./shared/interfaces/routes.interface";
import { getRoutes } from "./config/routes";
// import { Database } from "lib-database/src/shared/config/database";

const ServerDbConnect = async () => {
  // await Database.connect();
  startServer();
};

const startServer = async () => {
  const { port } = config.server;

  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );
  app.use(morgan("combined"));

  app.get("/ms-gateway", async (_req: Request, res: Response) => {
    res.json({
      data: "Bienvenido/a, pero no hay nada que ver aquí!.",
      message: OK_200,
    });
  });

  (global as any).requestCounts = {};
  setInterval(() => {
    Object.keys((global as any).requestCounts).forEach((ip) => {
      (global as any).requestCounts[ip] = 0;
    });
  }, 60000);

  app.use(rateLimitAndTimeout);

  const routes = await getRoutes();

  routes.forEach((item: RoutesInterface) => {
    const proxyOptions = {
      logger: console,
      target: item.target,
      changeOrigin: true,
      pathRewrite: {
        [`^${item.route}`]: "",
      },
      on: {
        error: (err: any, _req: any, res: any, _target: any) => {
          res.status(CodeHttpEnum.internalServerError).json({
            message: err.code,
            statusCode: err.code,
          });
        },
        econnreset: (err: any, _req: any, res: any, _target: any) => {
          res.status(CodeHttpEnum.internalServerError).json({
            message: err.code,
            statusCode: err.code,
          });
        },
      },
    };
    const middlewares = item.middlewares.map((middleware) => {
      const { middlewareName } = require(`./shared/middlewares/${middleware}`);
      return middlewareName;
    });
    app.use(item.route, ...middlewares, createProxyMiddleware(proxyOptions));
  });

  app.use((_req: Request, res: Response) => {
    res.status(CodeHttpEnum.notFound).json({
      message: ERR_404,
      statusCode: CodeHttpEnum.notFound,
    });
  });

  process.env.TZ = "America/Guayaquil";
  app.listen(Number(port), () => {
    console.info(`API-GATEWAY iniciado en el puerto: ${port}`);
  });
};

ServerDbConnect();

// Cerrar la conexión a la base de datos al salir de la aplicación
process.on("SIGINT", async () => {
  // await Database.disconnect();
  process.exit(0);
});
