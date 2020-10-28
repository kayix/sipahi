import { logger } from "../utils/logger";
import { Logger as ILogger } from "pino";
import { Injectable } from "@nestjs/common";

@Injectable()
export class Logger {
  logger: ILogger;

  constructor() {
    this.logger = logger;
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
