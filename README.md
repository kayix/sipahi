## What is Sipahi 
Batteries included grpc server for NodeJS. Supports middleware, interceptor, error handling. 

All codebase is 200 lines of code. Simple & flexible best for microservices.

# Features
- Middlewares
- Request & Response interceptors
- Error handling
- Built in logging ([pino](https://github.com/pinojs/pino))
- Multiple proto files
- Pure javascript using [grpc-js](https://www.npmjs.com/package/@grpc/grpc-js) as server
- Built with Typescript 

# Installation
```bash
npm install sipahi

or

yarn add sipahi
```

# Quickstart
```js
import { Sipahi } from 'sipahi'

const server = new Sipahi();

server.addProto(__dirname + "/proto/hello.proto", "hello");

server.use("Hello", async () => {
  return { message: "Hello response" };
});

server.listen({ host: '0.0.0.0', port: 50000 });

```


## Create app

```js
const server = new Sipahi();

const params = {
  host: '0.0.0.0',
  port: 50000
};

// Start server
server.listen(params) // Returns promise

// Close server
server.close();
```

## Add service
You can add multiple proto files by calling addProto multiple times.

Example:
```js
// server.addProto('proto path', 'package name');

server.addProto(__dirname + "/proto/product.service.proto", "catalog_product");
server.addProto(__dirname + "/proto/order.service.proto", "catalog_order");
```

## Define method for services
You need to define your methods in async function.

Example:
```js
server.use("GetProducts", async () => {
  return { products: [ { id: 1, title: "Sample product name" } ] };
});
```


## Middleware
You can modify requests or responses via middleware. To add middleware use `addHook` method.

There are 3 types of middeware.

1. -> onRequest
2. -> onResponse
3. -> onError

#### Example 1: Calculate elapsed time in your method
```js
// Set metadata so we can access it from after function execution.
server.addHook("onRequest", async ({ metadata }) => {
  metadata.set("elapsed", new Date().getTime());
});

// Calculate elapsed time after function execution completed.
server.addHook("onResponse", async ({ metadata }) => {
  console.log("Elapsed Time: " + (new Date().getTime() - metadata.get("elapsed")[0] + " ms"))
});

```

#### Example 2: Change request data before execution method
```js
server.addHook("onRequest", async ({ request }) => {
  request.user_id = 12;
});
```

#### Example 3: Catch errors
```js
server.addHook("onError", async ({ method, error }) => {
  console.log('Method: ', method);
  console.log('Error Message: ', error.message)
  console.log('Error Stack: ', error.stack)
});
```


## Logging
By default sihapi has pino as logging agent. You can configure it or use your own logging agent.


You can pass your logging options as logging params when creating server. Logging options in [here](https://getpino.io/#/docs/api)

```js
// Enable timestamp in logging
const server = new Sipahi({
  logger: {
    timestamp: true,
  },
});
```

You can access logger agent in methods or middlewares.

#### Access logger in methods.
```js
server.use("Hello", async ({ logger }) => {
  logger.info('Hello method fired');
  return { message: "Hello" };
});
```

#### Access logger in middleware.
```js
server.addHook("onError", async ({ error, logger }) => {
  logger.error({ message: error.message });
});
```

To disable built in logging agent, pass param as `false`
```js
const server = new Sipahi({
  logger: false,
});
```


 

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)