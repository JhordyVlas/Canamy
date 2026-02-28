import { AsyncLocalStorage } from "node:async_hooks";
import i18next, { type TFunction } from "i18next";
import backend from "i18next-fs-backend";
import type { I18nInstance, LocaleContext, TranslationFunction } from "./types";

const localeStorage = new AsyncLocalStorage<LocaleContext>();
const serviceInstances = new Map<string, I18nInstance>();
const translationCache = new Map<string, TranslationFunction>();

const createSafeTranslationFunction = (tFunction: TFunction): TranslationFunction => {
  return (key: string, options?: Record<string, string | number>): string => {
    const result = tFunction(key, options);

    if (typeof result === "string") {
      return result;
    }

    if (result && typeof result === "object" && "toString" in result) {
      return String(result);
    }

    if (process.env.NODE_ENV === "development") {
      console.warn(`Translation missing for key: ${key}`);
    }

    return key;
  };
};

export const createI18nInstance = async (serviceName: string): Promise<I18nInstance> => {
  const existing = serviceInstances.get(serviceName);
  if (existing) {
    return existing;
  }

  const instance = i18next.createInstance();

  await instance.use(backend).init({
    lng: "en",
    backend: {
      loadPath: `./resources/locales/{{lng}}/{{ns}}.json`,
    },
    fallbackLng: "en",
    preload: ["es", "en"],
    ns: [serviceName, "common"],
    defaultNS: serviceName,
    fallbackNS: "common",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false,
    },
    returnObjects: false,
    returnEmptyString: false,
  });

  serviceInstances.set(serviceName, instance);
  return instance;
};

export const runWithLocaleContext = <T>(locale: string, t: TranslationFunction, fn: () => T): T => {
  return localeStorage.run({ locale, t }, fn);
};

export const createTranslationFunction = async (
  serviceName: string,
  locale = "es",
): Promise<TranslationFunction> => {
  const cacheKey = `${serviceName}:${locale}`;

  const cached = translationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const instance = await createI18nInstance(serviceName);
  const tFunction = instance.getFixedT(locale);
  const safeT = createSafeTranslationFunction(tFunction);

  translationCache.set(cacheKey, safeT);
  return safeT;
};

export const getCurrentT = (): TranslationFunction => {
  const store = localeStorage.getStore();
  if (!store) {
    throw new Error("No locale context found. Make sure localizationMiddleware is applied.");
  }
  return store.t;
};

export const getCurrentLocale = (): string => {
  const store = localeStorage.getStore();
  if (!store) {
    throw new Error("No locale context found. Make sure localizationMiddleware is applied.");
  }
  return store.locale;
};

export const clearTranslationCache = (serviceName?: string): void => {
  if (serviceName) {
    const keysToDelete: string[] = [];

    for (const key of translationCache.keys()) {
      if (key.startsWith(`${serviceName}:`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      translationCache.delete(key);
    }

    serviceInstances.delete(serviceName);
  } else {
    translationCache.clear();
    serviceInstances.clear();
  }
};
