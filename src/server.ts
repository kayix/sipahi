import { Server, ServerCredentials, ServerUnaryCall, status } from "grpc";
/**
 * Sipahi Helpers
 */
import "./utils/env";
import { getServiceNames, loadPackage, lookupPackage } from "./utils/loader";
import { Method, Validate, Controller } from "./utils/decorators";
import { error } from "./utils/error";
/**
 * Nestjs Core
 */
import { AppModule } from "./ioc/module";
import { NestFactory } from "@nestjs/core";
import { Injectable } from "@nestjs/common";
/**
 * IOC Container
 */
import { initContainer } from "./ioc/";
/**
 * Input Validation
 */
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
/**
 * Default Services
 */
import { Lang } from "./services/lang";
import { Logger } from "./services/logger";
import { initLocalize, trans, getLocale, setLocale } from "./utils/localize";
import { LocaleType } from "./utils/types";

import { LocalError } from "./utils/errors/helper";

interface Proto {
  path: string;
  package: string;
}

declare type ErrHookHandler = (myArgument: { service: string; method: string; type: "validation" | "service"; error: any }) => any;

export class Sipahi {
  private errHook: ErrHookHandler;
  private localeKey: string | undefined;
  private protoList: Proto[];
  private providers: Function[];

  public server: Server;

  constructor() {
    this.protoList = [];
    this.providers = [];
    this.initialize();
    this.initLogger();
    this.localeKey = "locale";
  }

  private initLogger() {
    this.addProvider(Logger);
    this.addProvider(Lang);
  }

  public useLocale(params: LocaleType) {
    initLocalize(params);
    if (params.metadataKey) {
      this.localeKey = params.metadataKey;
    }
  }

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

  private async syncMethods() {
    const self = this;
    const { serverMethods } = initContainer(this.providers);

    const app = await NestFactory.createApplicationContext(AppModule, { logger: false });

    let resolveClasses: { [key: string]: any } = {};

    serverMethods.forEach((serverMethod) => {
      resolveClasses[serverMethod.className] = app.get(serverMethod.className);
    });

    const result: { [key: string]: any } = {};
    serverMethods.forEach((serverMethod) => {
      serverMethod.methods.forEach((method) => {
        if (!result[method.proto.service]) {
          result[method.proto.service] = {};
        }
        result[method.proto.service][method.proto.method] = function (call: ServerUnaryCall<any>, callback) {
          if (call.metadata.get(self.localeKey)[0]) {
            setLocale(call.metadata.get(self.localeKey)[0].toString());
          }
          if (method.validator) {
            let classData = plainToClass(method.validator, call.request);

            validate(classData)
              .then((errors) => {
                if (errors.length > 0) {
                  /*
                  let errMessage = JSON.stringify(
                    errors.map((error) => {
                      let obj: any = {};
                      obj[error.property] = trans(serverMethod.className + "." + error.target.constructor.name + "." + error.property + "." + Object.keys(error.constraints)[0]);
                      return obj;
                    })
                  );
                  self.errHook({ service: method.proto.service, method: method.proto.method, type: "validation", message: errMessage });
                  callback({
                    message: errMessage,
                    code: status.INVALID_ARGUMENT,
                  });
                  */
                  let errFn = self.errHook({ service: method.proto.service, method: method.proto.method, type: "validation", error: errors });
                  callback(errFn, null);
                } else {
                  resolveClasses[serverMethod.className]
                    [method.funcName](call.request, call.metadata)

                    .then((resp) => {
                      callback(null, resp);
                    })
                    .catch((err) => {
                      let errFn = self.errHook({ service: method.proto.service, method: method.proto.method, type: "service", error: err });
                      callback(errFn, null);
                      /*
                      if (err instanceof LocalError) {
                        self.errHook({ service: method.proto.service, method: method.proto.method, type: "service", message: err.message, stacktrace: err });
                      } else {
                        self.errHook({ service: method.proto.service, method: method.proto.method, type: "server", message: err.message, stacktrace: err });
                      }

                      callback({ message: trans(err.message), code: err.code }, null);*/
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
                let errFn = self.errHook({ service: method.proto.service, method: method.proto.method, type: "service", error: err });
                callback(errFn, null);
                /*
                if (err instanceof LocalError) {
                  self.errHook({ service: method.proto.service, method: method.proto.method, type: "service", message: err.message, stacktrace: err });
                } else {
                  self.errHook({ service: method.proto.service, method: method.proto.method, type: "server", message: err.message, stacktrace: err });
                }
                callback({ message: trans(err.message), code: err.code }, null);*/
              });
          }
        };
      });
    });

    this.protoList.forEach((proto) => {
      const pkg = lookupPackage(loadPackage(proto.path), proto.package);
      for (const serviceName of getServiceNames(pkg)) {
        const serviceData = (pkg[serviceName] as any) as any;
        if (result[serviceName]) {
          this.server.addService(serviceData.service, result[serviceName]);
        }
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
      await this.syncMethods();
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

  onError(func: ErrHookHandler) {
    this.errHook = func;
  }
}

export { Logger, Lang, Injectable, Controller };

export { Method, Validate, status, error };
