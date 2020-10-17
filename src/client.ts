import { dotProp } from "./utils/helpers";
import * as protoLoader from "@grpc/proto-loader";
import { credentials, loadPackageDefinition } from "grpc";

export class Client {
  private readonly _protoPath: string;
  private readonly _pkgName: string;
  private readonly _serviceName: string;
  private _client: any;
  constructor(params: { proto: string; package: string; service: string; host: string; port: number; credentials?: any }) {
    this._protoPath = params.proto;
    this._pkgName = params.package;
    this._serviceName = params.service;
    this.connect({ host: params.host, port: params.port, credentials: params.credentials });
  }

  private connect(params: { host: string; port: number; credentials?: any }) {
    const getPkg = loadPackageDefinition(protoLoader.loadSync(this._protoPath));
    const service = dotProp(getPkg, this._pkgName);
    this._client = new service[this._serviceName](params.host + ":" + params.port, params.credentials ? credentials.createInsecure() : credentials.createInsecure());
  }

  unary(key: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._client[key](params, (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      });
    });
  }
}
