import { resolve } from "path";
import { Client } from "./client";
import { Sipahi } from "./server";
import * as protoLoader from "@grpc/proto-loader";
import { loadPackageDefinition } from "@grpc/grpc-js";

let server: Sipahi;
let packageDefinition;
let service;
let client: Client;
beforeAll(() => {
  server = new Sipahi();
  packageDefinition = protoLoader.loadSync(resolve("example/proto/hello.proto"), {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
  });
  service = loadPackageDefinition(packageDefinition).hello;
  client = new Client({ proto: resolve("example/proto/hello.proto"), package: "hello", service: "HelloService", host: "0.0.0.0", port: 3010 });
});

afterAll(() => {
  server.close();
});

describe("Test grpc server", () => {
  test("check server is listening", async () => {
    expect.assertions(1);
    try {
      const { port } = await server.listen({ port: 3010 });
      expect(port).toBe(3010);
      server.close();
    } catch (e) {
      expect(e).toMatch("error");
    }
  });

  test("add proto file", async () => {
    try {
      server.addProto(resolve("example/proto/hello.proto"), "hello");
    } catch (e) {}
  });

  test("add method to server", async () => {
    try {
      server.use("Hello", async () => {
        return { message: "Hello response" };
      });
    } catch (e) {}
  });

  test("call method from client", async () => {
    await server.listen({ port: 3010 });
    let response = await client.unary("Hello", { name: "Sample Name" });
    expect(response.message).toBe("Hello response");
  });
});
