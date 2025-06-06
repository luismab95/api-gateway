import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

const logDir = path.resolve(__dirname, "../../../", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFormat = format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// Helper para filtrar por nivel exacto
const filterOnly = (level: string) =>
  format((info) => (info.level === level ? info : false))();

const logger = createLogger({
  level: "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, "error.log"),
      format: filterOnly("error"),
    }),
    new transports.File({
      filename: path.join(logDir, "warn.log"),
      format: filterOnly("warn"),
    }),
    new transports.File({
      filename: path.join(logDir, "info.log"),
      format: filterOnly("info"),
    }),
    new transports.File({
      filename: path.join(logDir, "debug.log"),
      format: filterOnly("debug"),
    }),
  ],
});

export { logger };
