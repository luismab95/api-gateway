import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { environment, errorHandler, logger } from "./shared";
import { startProxy } from "./config/proxy";
import { disconnectDB } from "./config/dbConnection";

const startServer = async () => {
  await runServer();
};

const runServer = async () => {
  const { HOST, PORT, CORS_ORIGIN } = environment;

  const app = express();
  const corsOptions = {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
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

  const apiProxy = await startProxy();
  apiProxy.forEach((api) => {
    app.use(api.route, api.middlewares, api.proxy);
  });

  app.use((req: Request, res: Response, _next: NextFunction) => {
    const message = `Cannot Found: ${req.method} ${req.originalUrl}`;
    logger.error(message);
    res.status(404).json({
      status: false,
      message,
    });
  });

  app.use(errorHandler);

  app.listen(PORT, HOST, () => {
    logger.info(`GATEWAY iniciado en http://${HOST}:${PORT}`);
  });
};

startServer();

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});
