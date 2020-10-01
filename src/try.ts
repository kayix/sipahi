import { resolve } from "path";
import { Sipahi, Client } from "./server";

const proto = resolve("example/proto/hello.proto");

async function start() {
  /**
   * Create Grpc Server
   */

  const server = new Sipahi();

  // Add proto file
  server.addProto(proto, "hello");

  // Add method
  server.use("Hello", async () => {
    return { message: Math.random().toString().slice(-8) };
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
  const client = new Client({ proto: proto, package: "hello", service: "HelloService", host: "0.0.0.0", port: 3012 });

  // Make unary call to server
  let resp = await client.unary("Hello", { name: "Hello there!" });

  console.log("resp", resp);
}

start();
