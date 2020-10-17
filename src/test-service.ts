import { Method } from "./server";
import { injectable } from "inversify";

@injectable()
export class TestService {
  @Method("HelloService", "Hello")
  async getHello(request: { name: string }) {
    return { message: request.name };
  }
}
