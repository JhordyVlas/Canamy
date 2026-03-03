import log from "encore.dev/log";
import type { TFunction } from "i18next";
import { getCurrentT, getSyncTranslation } from "./i18n";
import type { SupportedLanguage } from "./types";

type ExtendedTFunction = TFunction & {
  sync: (lang: SupportedLanguage, key: string, options?: Record<string, string | number>) => string;
};

const t: ExtendedTFunction = ((...args: [...Parameters<TFunction>]): ReturnType<TFunction> => {
  try {
    const contextT = getCurrentT();
    // biome-ignore lint/suspicious/noExplicitAny: contextT es TranslationFunction que acepta menos parámetros que TFunction
    return contextT(args[0] as any, args[1] as any) as ReturnType<TFunction>;
  } catch (error) {
    log.error(`Translation context not available for key: ${args[0]}`, error);
    return String(args[0]) as ReturnType<TFunction>;
  }
}) as ExtendedTFunction;

t.sync = (
  lang: SupportedLanguage,
  key: string,
  options?: Record<string, string | number>,
): string => {
  try {
    const serviceName = globalThis.__CURRENT_SERVICE_NAME__;

    if (!serviceName) {
      log.error("Service name not configured. Ensure createLocalizationMiddleware is initialized.");
      return key;
    }

    const syncT = getSyncTranslation(serviceName, lang);
    return syncT(key, options);
  } catch (error) {
    log.error(`Sync translation error for ${lang}:${key}`, error);
    return key;
  }
};

export default t;
