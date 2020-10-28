import { Injectable } from "@nestjs/common";
import { trans, getLocale, setLocale } from "../utils/localize";
import { TOptions } from "i18next";

@Injectable()
export class Lang {
  getLocale(): string {
    return getLocale();
  }

  setLocale(newLocale: string): Promise<any> {
    return setLocale(newLocale);
  }

  trans(key: string, ops?: TOptions) {
    return trans(key, ops);
  }
}
