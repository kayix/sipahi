import { status } from "grpc";

export class ServiceError extends Error {
  private code: status;
  constructor(message: string, errStatus?: status) {
    super(message);
    this.name = "ServiceError";
    this.code = errStatus ? errStatus : status.INTERNAL;
  }
}

export function errorr(message: string, status?: status) {
  throw new ServiceError(message, status);
}

class MethodError extends Error {
  private code: status;
  constructor(message: string, errStatus?: status) {
    super(message);
    this.name = "ServiceError";
    this.code = errStatus ? errStatus : status.INTERNAL;
  }
}

export function error(message: string, status?: status) {
   throw new MethodError(message, status);
}
