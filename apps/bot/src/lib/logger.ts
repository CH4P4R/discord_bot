import { createLogger, format, transports } from "winston";
import type { AppConfig } from "../config/env";

export const buildLogger = (config: AppConfig) => {
  const logger = createLogger({
    level: config.logging.level,
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.errors({ stack: true }),
      format.colorize({ all: true }),
      format.printf(({ level, message, timestamp, stack, ...meta }) => {
        const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
        return stack ? `${timestamp} [${level}] ${stack}${metaString}` : `${timestamp} [${level}] ${message}${metaString}`;
      })
    ),
    transports: [new transports.Console()]
  });

  return logger;
};

export type Logger = ReturnType<typeof buildLogger>;
