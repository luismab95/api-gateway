import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export class LoggingService {
  private logger: winston.Logger;
  private customLevels = {
    levels: {
      error: 0,
      warning: 1,
      info: 2,
      debug: 3,
    },
    colors: {
      error: "red",
      warning: "yellow",
      info: "green",
      debug: "blue",
    },
  };

  constructor() {
    this.logger = winston.createLogger({
      levels: this.customLevels.levels,
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS Z" }),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
          dirname: "logs",
          filename: "ms-gateway-%DATE%.log",
          datePattern: "YYYY-MM",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "12m",
        }),
      ],
    });
  }

  error(message: string): void {
    this.logger.error(message);
  }

  warning(message: string): void {
    this.logger.warning(message);
  }

  info(message: string): void {
    this.logger.info(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }
}
