import { status } from "grpc";
import { logger } from "../logger";
import { CatchAll } from "./decorator";

export class LocalError extends Error {
  constructor(error) {
    super(error);
    this.name = "LocalError";
  }
}

export class ServerError extends Error {
  constructor(error) {
    super(error);
    // @ts-ignore
  //  this.code = status.INTERNAL;
    this.name = "ServerError";
    //  this.message = "this is custom server error";
    //  logger.error(error);
  }
}

export function error(message: string) {
  // logger.info(message);
  throw new LocalError(message);
}

export const Catch = CatchAll((err, ctx) => {
  if (err instanceof LocalError) {
    throw new LocalError(err);
  } else {
    throw new ServerError(err);
  }
});
