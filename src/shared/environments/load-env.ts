import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  server: {
    hostname: process.env.HOST || "0.0.0.0",
    port: Number(process.env.PORT) || 9000,
    rateLimit: Number(process.env.RATE_LIMIT),
  },
};
