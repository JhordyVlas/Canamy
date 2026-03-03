import "i18next";

type AuthTranslations = typeof import("../../resources/locales/en/auth.json");
type CommonTranslations = typeof import("../../resources/locales/en/common.json");

type CombinedTranslations = AuthTranslations & CommonTranslations;

declare module "i18next" {
  interface CustomTypeOptions {
    returnNull: false;
    returnEmptyString: false;
    returnObjects: false;
    defaultNS: "auth";
    resources: {
      auth: CombinedTranslations;
      common: CombinedTranslations;
    };
  }
}
