import I18n from "i18n";

let i18nGlobal: any = {};

export function initLocalize(params: { locales: string[]; directory: string, default: string }) {
  I18n.configure({
    locales: params.locales,
    directory: params.directory,
    register: i18nGlobal,
    defaultLocale: params.default,
    extension: ".json",
    objectNotation: true,
  });
}

export function trans(key: string, opts?: any) {
  if (opts && opts.locale) {
    i18nGlobal.setLocale(opts.locale);
  }

  return i18nGlobal.__(key);
}

export function getLocale(): string {
  return;
}

export async function setLocale(newLocale: string): Promise<any> {
  i18nGlobal.setLocale(newLocale);
}
