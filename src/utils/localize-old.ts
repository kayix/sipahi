import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { InitOptions, TOptions } from "i18next";
import { LocaleType } from "./types";
import get from "lodash/get";
import set from "lodash/set";
import fs from "fs";

function getLocalePath(dir: string, locale: string): string {
  return dir.endsWith("/") ? dir + "/" + locale + ".json" : dir + "/" + locale + ".json";
}

export function initLocalize(params: LocaleType) {
  console.log(params);
  let getDirectory = params.directory.endsWith("/") ? params.directory + "{{lng}}.json" : params.directory + "/{{lng}}.json";
  const config: InitOptions = {
    // backend: { loadPath: getDirectory },
    resources: {
      en: {
        translation: {
          key: "hello world",
        },
      },
      tr: {
        translation: {
          key: "merhaba",
        },
      },
    },
    debug: false,
    load: "all",
    initImmediate: true,
    fallbackLng: params.fallBack,
    lng: params.default,
    preload: params.locales,
    saveMissing: true,
    saveMissingTo: "all",
    supportedLngs: params.locales,
    missingKeyHandler: (lngs, ns, key) => {
      console.log("i18next.languages", i18next.languages);
      for (let lng of i18next.languages) {
        let obj = i18next.getDataByLanguage(lng).translation;
        if (!get(obj, key)) {
          fs.truncateSync(getLocalePath(params.directory, lng), 0);
          fs.writeFileSync(getLocalePath(params.directory, lng), JSON.stringify(set(obj, key, ""), null, 2));
        }
      }
      i18next.reloadResources();
    },
  };

  //i18next.use(Backend).init(config);
}

export function getLocale(): string {
  return i18next.language;
}

export function setLocale(newLocale: string): Promise<any> {
  return i18next.changeLanguage(newLocale);
}

export function trans(key: string, ops?: TOptions) {
  return i18next.t(key, ops);
}
