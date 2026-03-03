import { AsyncLocalStorage } from "node:async_hooks";
import i18next from "i18next";
import backend from "i18next-fs-backend";
import type { I18nInstance, LocaleContext, SupportedLanguage, TranslationFunction } from "./types";

const localeStorage = new AsyncLocalStorage<LocaleContext>();
const serviceInstances = new Map<string, I18nInstance>();
const translationFunctionCache = new Map<string, TranslationFunction>();

export const createI18nInstance = async (serviceName: string): Promise<I18nInstance> => {
  const existing = serviceInstances.get(serviceName);
  if (existing) {
    return existing;
  }

  const instance = i18next.createInstance();

  await instance.use(backend).init({
    lng: "en",
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    load: "all",
    backend: {
      loadPath: `./resources/locales/{{lng}}/{{ns}}.json`,
    },
    ns: [serviceName, "common"],
    defaultNS: serviceName,
    fallbackNS: "common",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    returnObjects: false,
    returnEmptyString: false,
  });

  await instance.loadLanguages(["es", "en"]);

  instance.languages = ["es", "en"];

  const languages: SupportedLanguage[] = ["es", "en"];
  for (const lang of languages) {
    const cacheKey = `${serviceName}:${lang}`;

    const safeT: TranslationFunction = (
      key: string,
      options?: Record<string, string | number>,
    ): string => {
      const baseOptions = options || {};

      const serviceOptions = { ...baseOptions, lng: lang, ns: serviceName };
      // biome-ignore lint/suspicious/noExplicitAny: i18next types are too complex for this use case
      const resultWithNs = instance.t(key, serviceOptions as any);

      if (typeof resultWithNs === "string" && resultWithNs !== key) {
        return resultWithNs;
      }

      const commonOptions = { ...baseOptions, lng: lang, ns: "common" };
      // biome-ignore lint/suspicious/noExplicitAny: i18next types are too complex for this use case
      const resultCommon = instance.t(key, commonOptions as any);

      if (typeof resultCommon === "string") {
        return resultCommon;
      }

      return key;
    };

    translationFunctionCache.set(cacheKey, safeT);
  }

  serviceInstances.set(serviceName, instance);
  return instance;
};

export const runWithLocaleContext = <T>(locale: string, t: TranslationFunction, fn: () => T): T => {
  return localeStorage.run({ locale, t }, fn);
};

export const getCurrentT = (): TranslationFunction => {
  const store = localeStorage.getStore();
  if (!store) {
    throw new Error("No locale context found. Use t.sync() outside of request context.");
  }
  return store.t;
};

export const getCurrentLocale = (): string => {
  const store = localeStorage.getStore();
  if (!store) {
    throw new Error("No locale context found. Use t.sync() outside of request context.");
  }
  return store.locale;
};

export const getSyncTranslation = (
  serviceName: string,
  lang: SupportedLanguage,
): TranslationFunction => {
  const cacheKey = `${serviceName}:${lang}`;
  const cached = translationFunctionCache.get(cacheKey);

  if (!cached) {
    throw new Error(
      `Translations not loaded for ${serviceName}:${lang}. Ensure createI18nInstance was called during middleware initialization.`,
    );
  }

  return cached;
};

export const clearTranslationCache = (serviceName?: string): void => {
  if (serviceName) {
    const keysToDelete: string[] = [];

    for (const key of translationFunctionCache.keys()) {
      if (key.startsWith(`${serviceName}:`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      translationFunctionCache.delete(key);
    }

    serviceInstances.delete(serviceName);
  } else {
    translationFunctionCache.clear();
    serviceInstances.clear();
  }
};
