import * as dotenv from "dotenv";
dotenv.config();

export const environment = {
  HOST: process.env.HOST || "0.0.0.0",
  PORT: Number(process.env.PORT) || 9000,
  RATE_LIMIT: Number(process.env.RATE_LIMIT) || 20,
  TZ: process.env.TZ,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  MONGO_DB_URI: process.env.MONGO_DB_URI || "*",
};
