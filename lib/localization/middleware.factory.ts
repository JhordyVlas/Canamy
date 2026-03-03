import { middleware } from "encore.dev/api";
import log from "encore.dev/log";
import { createI18nInstance, getSyncTranslation, runWithLocaleContext } from "./i18n";
import type { I18nInstance, SupportedLanguage } from "./types";

const parseAcceptLanguage = (acceptLang?: string | string[]): SupportedLanguage => {
  const langString = Array.isArray(acceptLang) ? acceptLang[0] : acceptLang;
  if (!langString) return "es";

  const primaryLang = langString.split(",")[0].split("-")[0].split(";")[0].toLowerCase();
  return ["es", "en"].includes(primaryLang) ? (primaryLang as SupportedLanguage) : "es";
};

const getAcceptLanguageHeader = (
  headers: Record<string, string | string[] | undefined>,
): string | string[] | undefined => {
  return (
    headers["Accept-Language"] ||
    headers["accept-language"] ||
    headers["ACCEPT-LANGUAGE"] ||
    headers["Accept-language"]
  );
};

export const createLocalizationMiddleware = (serviceName: string) => {
  let i18nInstancePromise: Promise<I18nInstance> | null = null;

  globalThis.__CURRENT_SERVICE_NAME__ = serviceName;

  return middleware(async (req, next) => {
    if (req.requestMeta?.type === "api-call") {
      try {
        if (!i18nInstancePromise) {
          i18nInstancePromise = createI18nInstance(serviceName);
        }

        await i18nInstancePromise;

        const acceptLanguageHeader = getAcceptLanguageHeader(req.requestMeta.headers);
        const lang = parseAcceptLanguage(acceptLanguageHeader);

        const t = getSyncTranslation(serviceName, lang);

        return runWithLocaleContext(lang, t, () => next(req));
      } catch (error) {
        log.error(`Localization middleware error for service ${serviceName}:`, error);

        const fallbackT = getSyncTranslation(serviceName, "es");
        return runWithLocaleContext("es", fallbackT, () => next(req));
      }
    }

    return next(req);
  });
};
