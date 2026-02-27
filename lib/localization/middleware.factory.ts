import { middleware } from "encore.dev/api";
import log from "encore.dev/log";

import { createI18nInstance, runWithLocaleContext } from "./i18n";
import type { I18nInstance, TranslationFunction } from "./types";

const parseAcceptLanguage = (acceptLang?: string | string[]): string => {
  const langString = Array.isArray(acceptLang) ? acceptLang[0] : acceptLang;
  if (!langString) return "es";

  const primaryLang = langString.split(",")[0].split("-")[0].split(";")[0].toLowerCase();
  return ["es", "en"].includes(primaryLang) ? primaryLang : "es";
};

export const createLocalizationMiddleware = (serviceName: string) => {
  let i18nInstancePromise: Promise<I18nInstance> | null = null;

  return middleware(async (req, next) => {
    if (req.requestMeta?.type === "api-call") {
      try {
        if (!i18nInstancePromise) {
          i18nInstancePromise = createI18nInstance(serviceName);
        }

        const i18nInstance = await i18nInstancePromise;

        const lang = parseAcceptLanguage(req.requestMeta.headers["accept-language"]);

        await i18nInstance.changeLanguage(lang);
        const tFunction = i18nInstance.getFixedT(lang);

        const t: TranslationFunction = (
          key: string,
          options?: Record<string, string | number>,
        ): string => {
          const result = tFunction(key, options);
          return typeof result === "string" ? result : String(result);
        };

        return runWithLocaleContext(lang, t, () => next(req));
      } catch {
        log.error(`Localization middleware error for service ${serviceName}:`);

        const fallbackT: TranslationFunction = (key: string) => key;
        return runWithLocaleContext("es", fallbackT, () => next(req));
      }
    }

    return next(req);
  });
};
