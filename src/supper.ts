import { Sipahi, Method, logger, Validate } from "./server";
import { resolve } from "path";
import { injectable } from "inversify";
import { error } from "./utils/error";
import { IsEmail, IsNotEmpty } from "class-validator";

class LoginInput {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

@injectable()
export class TestService {
  @Validate(LoginInput)
  @Method("HelloService", "Hello")
  getHello(request: { name: string }, meta) {
    return new Promise((resolve, reject) => {
      logger.error("this log level is error");

      resolve({ message: request.name });
    });

    //  return error("blocked system 13 moruk :D", status.DATA_LOSS);
  }
}

const server = new Sipahi({});

server.addProto(resolve("example/proto/hello.proto"), "hello");
server.addProvider(TestService);

server.listen({ port: 5009 }).then(() => {
  console.log("listening on: 5009");
});
