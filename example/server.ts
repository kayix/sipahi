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
export class MyService {
  test() {
    console.log("aaaaa");
  }
}

@injectable()
export class TestService {
  private logger: Logger;
  private myService: MyService;
  constructor(@inject(Logger) logger: Logger, @inject(MyService) myService) {
    this.logger = logger;
    this.myService = myService;
  }

  @Validate(LoginInput)
  @Method("HelloService", "Hello")
  getHello(request: { name: string }, { logger }) {
    this.logger.error("aaaa", 22, 242, 2424242);
    this.myService.test();
    return new Promise((resolve, reject) => {
      resolve({ message: request.name });
    });

    //  return error("blocked system 13 moruk :D", status.DATA_LOSS);
  }
}

const server = new Sipahi();

server.addProto(resolve("example/proto/hello.proto"), "hello");
server.addProvider(TestService);
server.addProvider(MyService);

server.listen({ port: 5009 }).then(() => {
  console.log("listening on: 5009");
});
