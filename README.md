## What is Sipahi

Batteries included grpc server for NodeJS. Supports middleware, error handling and logging.

All codebase is 200 lines of code. Simple & flexible best for microservices.

### Updates:
- Added grpc client
- Removed onResponse middleware
- Pretty log format for development

# Features

- Promise Based Server & Client
- Request Middleware
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
/**
* Create Grpc Server
*/
import { Sipahi, Client } from "sipahi";

const server = new Sipahi();

// Add proto file
server.addProto(__dirname + "/proto/hello.proto", "hello");

// Add method 
server.use("Hello", async ({ request, logger }) => {
  logger.info('Log in here')
  return { message: 'Hello you bro! ' + request.name };
});

// Listen errors
server.addHook("onError", async ({ error, logger }) => {
  logger.error(error.message);
});

// Start server
await server.listen({ host: "0.0.0.0", port: 3012 });



/**
* Create Grpc Client
*/
const client = new Client({ proto: __dirname + "/proto/hello.proto", package: "hello", service: "HelloService", host: "0.0.0.0", port: 3012 });

// Make unary call to server
await client.unary("Hello", { name: 'Hello there!' });


```

## Add service

You can add multiple proto files by calling addProto multiple times.

Example:

```js
// server.addProto('proto path', 'package name');

server.addProto(__dirname + "/proto/product.service.proto", "catalog_product");
server.addProto(__dirname + "/proto/order.service.proto", "catalog_order");
```

## Add Methods

You need to define your methods in async function.

Example:

```js
server.use("GetProducts", async ({ request, logger, metadata }) => {
  return { products: [{ id: 1, title: "Sample product name" }] };
});


or 

import { UnaryCall } from 'sipahi'

async function getProducts({ request, logger, metadata }: UnaryCall) {
  return { products: [{ id: 1, title: "Sample product name" }] };
}

server.use("GetProducts", getProducts);

```

## Middleware

You can modify requests by using middleware. To add middleware use `addHook` method.

There are 2 types of middeware.

1. -> onRequest
3. -> onError


#### Example 1: Change request data before execution method

```js
server.addHook("onRequest", async ({  metadata, request, logger }) => {
  request.user_id = 12;
});
```


#### Example 2: Catch errors

```js
server.addHook("onError", async ({ method, error, logger }) => {
  logger.error("Method: ", method);
  logger.error("Error Message: ", error.message);
  logger.error("Error Stack: ", error.stack);
});
```

## Return Error
Sipahi includes error helper to throw error inside methods.

```js
import { error, status } from 'sipahi'

// Define sample method

server.use("GetProducts", async () => {
  
  return Promise.reject(error('something gonna wrong', status.ALREADY_EXISTS))

});
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
