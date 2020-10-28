type HandlerFunction = (error: Error, ctx: any) => void;

function _handleError(ctx: any, errorType: any, handler: HandlerFunction, error: Error) {
  // Check if error is instance of given error type
  if (typeof handler === 'function' && error instanceof errorType) {
    // Run handler with error object and class context
    handler.call(null, error, ctx);
  } else {
    // Throw error further
    // Next decorator in chain can catch it
    throw error;
  }
}

function _generateDescriptor(
  descriptor: PropertyDescriptor,
  errorType: any,
  handler: HandlerFunction
): PropertyDescriptor {
  // Save a reference to the original method
  const originalMethod = descriptor.value;

  // Rewrite original method with try/catch wrapper
  descriptor.value = function (...args: any[]) {
    try {
      const result = originalMethod.apply(this, args);

      // Check if method is asynchronous
      if (result && result instanceof Promise) {
        // Return promise
        return result.catch((error: any) => {
          _handleError(this, errorType, handler, error);
        });
      }

      // Return actual result
      return result;
    } catch (error) {
      _handleError(this, errorType, handler, error);
    }
  };

  return descriptor;
}

// Decorator factory function
export const Catch = (errorType: any, handler: HandlerFunction): any => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Method decorator
    if (descriptor) {
      return _generateDescriptor(descriptor, errorType, handler);
    }
    // Class decorator
    else {
      // Iterate over class properties except constructor
      for (const propertyName of Reflect.ownKeys(target.prototype).filter(prop => prop !== 'constructor')) {
        const desc = Object.getOwnPropertyDescriptor(target.prototype, propertyName)!;
        const isMethod = desc.value instanceof Function;
        if (!isMethod) continue;
        Object.defineProperty(target.prototype, propertyName, _generateDescriptor(desc, errorType, handler));
      }
    }
  };
};

export const CatchAll = (handler: HandlerFunction): any => Catch(Error, handler);
