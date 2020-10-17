import "./utils/env";
import "reflect-metadata";

import { Server, ServerCredentials, ServerUnaryCall, status } from "grpc";

import { getServiceNames, loadPackage, lookupPackage } from "./utils/loader";

import * as pino from "pino";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { initIoc } from "./ioc/container";

import { Method, Validate } from "./utils/decorators";
import { Logger } from "pino";

export { Method, Validate, Logger, status };

let baseLogger = pino({
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
export const logger = baseLogger.child({ level: process.env.NODE_ENV === "production" ? "warn" : "debug" });

interface Proto {
  path: string;
  package: string;
}

export class Sipahi {
  private protoList: Proto[];
  private providers: Function[];

  public server: Server;

  constructor() {
    this.protoList = [];
    this.providers = [];
    this.initialize();
    //  this.initLogger({});
  }
  /**
  private initLogger(config: any) {
    config = {
      ...config,
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
    };

    let baseLogger = pino(config);
    this.logger = baseLogger.child(config.properties ? config.properties : { level: process.env.NODE_ENV === "production" ? "warn" : "debug" })
  };*/

  private initialize() {
    this.server = new Server({
      "grpc.max_receive_message_length": -1,
      "grpc.max_send_message_length": -1,
    });
  }

  public addProto(path: string, pkg: string) {
    this.protoList.push({ path, package: pkg });
  }

  public addProvider(provider: Function) {
    this.providers.push(provider);
  }

  public addProviders(providers: Function[]) {
    this.providers = [...providers];
  }

  private syncMethods() {
    const { container, serverMethods } = initIoc(this.providers);

    let resolveClasses: { [key: string]: any } = {};

    serverMethods.forEach((serverMethod) => {
      resolveClasses[serverMethod.className] = container.get(serverMethod.className);
    });

    const result: { [key: string]: any } = {};
    serverMethods.forEach((serverMethod) => {
      serverMethod.methods.forEach((method) => {
        if (!result[method.proto.service]) {
          result[method.proto.service] = {};
        }

        result[method.proto.service][method.proto.method] = function (call: ServerUnaryCall<any>, callback) {
          if (method.validator) {
            let classData = plainToClass(method.validator, call.request);
            validate(classData)
              .then((errors) => {
                if (errors.length > 0) {
                  callback({
                    message: JSON.stringify(
                      errors.map((error) => {
                        let obj: any = {};
                        obj[error.property] = Object.values(error.constraints)[0];
                        return obj;
                      })
                    ),
                    code: status.INVALID_ARGUMENT,
                  });
                } else {
                  resolveClasses[serverMethod.className]
                    [method.funcName](call.request, call.metadata)
                    .then((resp) => {
                      callback(null, resp);
                    })
                    .catch((err) => {
                      callback({ message: err.message, code: err.code }, null);
                    });
                }
              })
              .catch((err) => {
                callback(err, status.INTERNAL);
              });
          } else {
            resolveClasses[serverMethod.className]
              [method.funcName](call.request, call.metadata)
              .then((resp) => {
                callback(null, resp);
              })
              .catch((err) => {
                callback({ message: err.message, code: err.code }, null);
              });
          }
        };
      });
    });

    this.protoList.forEach((proto) => {
      const pkg = lookupPackage(loadPackage(proto.path), proto.package);
      for (const serviceName of getServiceNames(pkg)) {
        const serviceData = (pkg[serviceName] as any) as any;
        this.server.addService(serviceData.service, result[serviceName]);
      }
    });
  }

  listen(args: { host?: string; port?: number } = {}): Promise<{ host: string; port: number }> {
    if (!args.host) {
      if (process.env.HOST) {
        args.host = process.env.HOST;
      } else {
        args.host = "0.0.0.0";
      }
    }

    if (!args.port) {
      if (process.env.PORT) {
        args.port = Number(process.env.PORT);
      } else {
        throw new Error("You need to define port argument!");
      }
    }

    return new Promise(async (resolve, reject) => {
      this.syncMethods();
      this.server.bindAsync(args.host + ":" + args.port, ServerCredentials.createInsecure(), (err) => {
        if (err) {
          return reject(err);
        }
        this.server.start();
        resolve({ host: args.host, port: args.port });
      });
    });
  }

  close() {
    return this.server.forceShutdown();
  }
}
