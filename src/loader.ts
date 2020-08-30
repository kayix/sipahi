import * as protoLoader from "@grpc/proto-loader";
import { GrpcObject, loadPackageDefinition } from "@grpc/grpc-js";

export function lookupPackage(root: GrpcObject, packageName: string) {
  let pkg = root;
  for (const name of packageName.split(/\./)) {
    pkg = pkg[name] as GrpcObject;
  }
  return pkg;
}

export function protoLoad(protoPath: string) {
  return protoLoader.loadSync(protoPath, {
    keepCase: true,
    defaults: true,
    oneofs: true,
  });
}

export function grpcLoad(protoPath: string) {
  return loadPackageDefinition(protoLoad(protoPath));
}

export function loadPackage(protoDir: string) {
  const proto = protoLoader.loadSync(protoDir);
  return loadPackageDefinition(proto);
}

export function getServiceNames(pkg: GrpcObject) {
  return Object.keys(pkg).filter((name) => (pkg[name] as any).service);
}
