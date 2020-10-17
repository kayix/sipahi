import { Container } from "inversify";

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

export function initIoc(services: any[]): { container: Container; serverMethods: ServerMethod[] } {
  const container = new Container();

  /**
   * Define base services
   */
  const baseServices: string[] = ["Logger"];
  /**
   * Load classes to ioc container
   */
  services.forEach((service) => {
    if (baseServices.includes(service.name)) {
      container.bind(service).toSelf();
    } else {
      container.bind(service.name).to(service);
    }
  });

  /**
   * Build service methods
   */
  let serverMethods: ServerMethod[] = [];

  services.forEach((service) => {
    if (Reflect.hasOwnMetadata("method", service)) {
      let subMethods: any[] = Reflect.getMetadata("method", service);

      let arrayMethods = subMethods.map((subMethod) => {
        if (Reflect.hasOwnMetadata("validator", service)) {
          let input = Reflect.getMetadata("validator", service);
          if (input.key === subMethod.key) {
            return {
              proto: {
                service: subMethod.service,
                method: subMethod.method,
              },
              funcName: subMethod.key,
              validator: input.validator,
            };
          }
        }
        return {
          proto: {
            service: subMethod.service,
            method: subMethod.method,
          },
          funcName: subMethod.key,
        };
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

  return { container, serverMethods };
}
