import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { startProxy } from "./config/proxy";
import { connectDB, disconnectDB } from "./config/dbConnection";
import { environment, errorHandler, logger, saveTraffic } from "./shared";

const startServer = async () => {
  await connectDB();
  await runServer();
};

const runServer = async () => {
  const { HOST, PORT, CORS_ORIGIN } = environment;

  const app = express();
  const corsOptions = {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

  let requestCount = 0;

  const countRequests = (_req: Request, _res: Response, next: NextFunction) => {
    requestCount++;
    next();
  };

  app.use(countRequests);

  setInterval(async () => {
    await saveTraffic(requestCount);
    requestCount = 0;
  }, 60000);

  app.get(`/`, (_req: Request, res: Response) => {
    res.status(200).json({
      status: true,
      message: "Bienvenido/a, pero no hay nada que ver aquí!.",
    });
  });

  app.use("/logs-gateway", express.static(path.join(__dirname, "../logs")));

  app.post("/restart-gateway", (_req: Request, res: Response) => {
    res.status(200).json({
      status: true,
      message: "Reiniciado....",
    });
    process.exit(0);
  });

  const apiProxy = await startProxy();

  apiProxy.forEach((api) => {
    app.use(api.route, api.proxy);
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
