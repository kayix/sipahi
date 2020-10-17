import { resolve } from "path";
import { inject, injectable } from "inversify";
import { IsEmail } from "class-validator";
import { Method, Validate } from "../src/utils/decorators";
import { Sipahi, Logger } from "../src/server";

class LoginInput {
  @IsEmail()
  name: string;
}

@injectable()
export class TestService {
  private logger: Logger;
  constructor(@inject(Logger) logger: Logger) {
    this.logger = logger;
  }

  @Validate(LoginInput)
  @Method("HelloService", "Hello")
  getHello(request: { name: string }, { logger }) {
    this.logger.error("aaaa", 22, 242, 2424242);
    return new Promise((resolve, reject) => {
      resolve({ message: request.name });
    });

    //  return error("blocked system 13 moruk :D", status.DATA_LOSS);
  }
}

const server = new Sipahi();

server.addProto(resolve("example/proto/hello.proto"), "hello");
 server.addProvider(TestService);

server.listen({ port: 5009 }).then(() => {
  console.log("listening on: 5009");
});
