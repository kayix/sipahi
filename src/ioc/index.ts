import { AppModule } from "../ioc/module";

interface ServerMethod {
  className: string;
  methods: {
    proto: {
      service: string;
      method: string;
    };
    funcName: string;
    validator?: any;
  }[];
}
export function initContainer(providers: any[]): { serverMethods: ServerMethod[] } {
  let serverMethods: ServerMethod[] = [];

  Reflect.defineMetadata("providers", providers, AppModule);

  providers.forEach((service) => {
    if (Reflect.hasOwnMetadata("method", service)) {
      let subMethods: any[] = Reflect.getMetadata("method", service);

      let funcValidators: { key: string; target: any; validator: any }[] = [];
      if (Reflect.hasOwnMetadata("validator", service)) {
        funcValidators = Reflect.getMetadata("validator", service);
      }

      let arrayMethods = subMethods.map((subMethod) => {
        let fndValidator = funcValidators.find((fnc) => fnc.key === subMethod.key);
        if (fndValidator) {
          return {
            proto: {
              service: subMethod.service,
              method: subMethod.method,
            },
            funcName: subMethod.key,
            validator: fndValidator.validator,
          };
        } else {
          return {
            proto: {
              service: subMethod.service,
              method: subMethod.method,
            },
            funcName: subMethod.key,
          };
        }
      });
      let findService = serverMethods.find((sm) => sm.className === service.name);
      if (findService) {
        findService.methods = [...arrayMethods];
      } else {
        serverMethods.push({
          className: service.name,
          methods: arrayMethods,
        });
      }
    }
  });

  return { serverMethods };
}
