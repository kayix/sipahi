export function Method(serviceName: string, methodName: string): any {
  return function (target: any, key: string, aa: any, bb: any) {
    let metadata = {
      key,
      service: serviceName,
      method: methodName,
      target,
    };

    let metadataList = [];
    if (!Reflect.hasMetadata("method", target.constructor)) {
      Reflect.defineMetadata("method", metadataList, target.constructor);
    } else {
      metadataList = Reflect.getMetadata("method", target.constructor);
    }
    metadataList.push(metadata);
  };
}

export function Validate(validator: any) {
  return function (target: any, key: any) {
    let metadata = {
      key,
      target,
      validator,
    };

    Reflect.defineMetadata("validator", metadata, target.constructor);
  };
}
