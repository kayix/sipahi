import { resolve } from "path";
import { Sipahi } from "./server";
import * as protoLoader from "@grpc/proto-loader";
import { loadPackageDefinition, credentials } from "@grpc/grpc-js";

let server: Sipahi;
let packageDefinition;
let service;
let client;
beforeAll(() => {
  server = new Sipahi();
  packageDefinition = protoLoader.loadSync(resolve("public/hello.proto"), {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
  });
  service = loadPackageDefinition(packageDefinition).hello;
  client = new service.HelloService("0.0.0.0:3010", credentials.createInsecure());
});

afterAll(() => {
  server.close();
});

function makeRequest(): Promise<any> {
  return new Promise((resolve, reject) => {
    client.hello({}, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

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
      server.addProto(resolve("public/hello.proto"), "hello");
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
    let response = await makeRequest();
    expect(response.message).toBe("Hello response");
  });
});
