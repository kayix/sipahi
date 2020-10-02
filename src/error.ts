import { status } from "@grpc/grpc-js";

export class ServiceError extends Error {
  private code: status;
  constructor(message: string, errStatus?: status) {
    super(message);
    this.name = "ServiceError";
    this.code = errStatus ? errStatus : status.INTERNAL;
  }
}

export function error(message: string, status?: status) {
  throw new ServiceError(message, status);
}
