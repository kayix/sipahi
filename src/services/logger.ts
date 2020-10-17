import * as pino from "pino";
import { injectable } from "inversify";
import { Logger as ILogger } from "pino";

@injectable()
export class Logger {
  logger: ILogger;

  constructor() {
    const baseLogger = pino({
      ...{
        prettyPrint: process.env.NODE_ENV !== "production",
        timestamp: true,
        messageKey: "message",
        base: null,
        formatters: {
          level(label) {
            return {
              level: label,
            };
          },
        },
      },
    });

    this.logger = baseLogger.child({ level: process.env.NODE_ENV === "production" ? "warn" : "debug" });
  }

  fatal(msg: string, ...args: any[]) {
    return this.logger.fatal(msg, args);
  }

  error(msg: string, ...args: any[]) {
    return this.logger.error(msg, args);
  }

  warn(msg: string, ...args: any[]) {
    return this.logger.warn(msg, args);
  }

  info(msg: string, ...args: any[]) {
    return this.logger.info(msg, args);
  }

  debug(msg: string, ...args: any[]) {
    return this.logger.debug(msg, args);
  }
}
