import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  server: {
    port: process.env.PORT,
    rateLimit: Number(process.env.RATE_LIMIT),
  },
};
