import { SCOPE_OPTIONS_METADATA } from "../../nest-master/packages/common/constants";
import { InjectableOptions } from "../../nest-master/packages/common/decorators/core";
import { Catch, CatchAll } from "./errors/decorator";
import { Injectable } from "../server";

export function Method(serviceName: string, methodName: string): any {
  return function (target: any, key: string) {
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
    //Reflect.defineMetadata("validator", metadata, target.constructor);

    let metadataList = [];
    if (!Reflect.hasMetadata("validator", target.constructor)) {
      Reflect.defineMetadata("validator", metadataList, target.constructor);
    } else {
      metadataList = Reflect.getMetadata("validator", target.constructor);
    }
    metadataList.push(metadata);
  };
}

export function MyInjectable(options?: InjectableOptions): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
  };
}

export function Controller(injectableOptions?: InjectableOptions, typeFunction?: any) {
  const injectableFn = MyInjectable(injectableOptions);
  const catchFn = CatchAll(typeFunction);

  return function (target: any ) {
    injectableFn(target);
    catchFn(target,  );
  };
}
