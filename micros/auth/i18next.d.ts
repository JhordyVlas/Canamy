import "i18next";
import type { AuthTranslations, CommonTranslations } from "~lib/localization/types";

type CombinedTranslations = AuthTranslations & CommonTranslations;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "auth";
    resources: {
      auth: CombinedTranslations;
      common: CombinedTranslations;
    };
  }
}
