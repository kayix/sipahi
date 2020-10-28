import { Method, Controller } from "../src/server";

@Controller()
export class TestService {
  @Method("AuthService", "Login")
  async getHello(request: { email: string }) {
    return { id: 1, token: "test" };
  }
}
