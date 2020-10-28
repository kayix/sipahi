import { status } from "grpc";
import { logger } from "./logger";

export class ServiceError extends Error {
  constructor(error: string) {
    super(error);
    this.name = "ServiceError";
  }
}

export function error(message: string) {
  return new ServiceError(message);
}

export function sendError(message: string) {
  throw new ServiceError(message);
}

export function catchError(e: Error) {
  if (e instanceof ServiceError) {
   // logger.info(e.message);
    throw new ServiceError(e.message);
  } else {
   // logger.error(e.message);
    throw new ServiceError("server_error");
  }
}
