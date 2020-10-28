import { resolve } from "path";
import { Sipahi } from "../src/server";
import { Client } from "../src/client";
import * as protoLoader from "@grpc/proto-loader";
import { loadPackageDefinition } from "grpc";

import { TestService } from "./test-service";

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
  client = new Client({ proto: resolve("example/proto/hello.proto"), package: "hello", service: "AuthService", host: "0.0.0.0", port: 3010 });
});

afterAll(() => {
  server.close();
});

describe("Test grpc server", () => {
  test("add proto file", async () => {
    try {
      server.addProto(resolve("example/proto/hello.proto"), "hello");
      server.addProvider(TestService);
      const { port } = await server.listen({ port: 3010 });
    } catch (e) {}
  });

  test("call method from client", async () => {
    let response = await client.unary("Login", { email: "karga@w.cn", password: "ewrwerwerwerwerewrew" });
    expect(response.id).toBe(1);
    expect(response.token).toBe("test");
  });
});
