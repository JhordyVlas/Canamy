import { AsyncLocalStorage } from "node:async_hooks";
import i18next from "i18next";
import backend from "i18next-fs-backend";
import type { I18nInstance, LocaleContext, SupportedLanguage, TranslationFunction } from "./types";

const localeStorage = new AsyncLocalStorage<LocaleContext>();

// Store por servicio con instancias precargadas
const serviceInstances = new Map<string, I18nInstance>();

// Cache de funciones de traducción por servicio y lenguaje
const translationFunctionCache = new Map<string, TranslationFunction>();

/**
 * Crea e inicializa una instancia de i18n para un servicio específico.
 * Precarga ambos idiomas (es, en) y los namespaces del servicio + common.
 */
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
    debug: false, // Cambiado a false para producción
    interpolation: {
      escapeValue: false,
    },
    returnObjects: false,
    returnEmptyString: false,
  });

  // Forzar la carga explícita de ambos idiomas
  await instance.loadLanguages(["es", "en"]);

  // Agregar ambos idiomas a la lista de languages
  instance.languages = ["es", "en"];

  // Precargar todas las funciones de traducción para acceso síncrono
  const languages: SupportedLanguage[] = ["es", "en"];
  for (const lang of languages) {
    const cacheKey = `${serviceName}:${lang}`;

    // Crear una función wrapper que busca en ambos namespaces
    const safeT: TranslationFunction = (
      key: string,
      options?: Record<string, string | number>,
    ): string => {
      // Intentar con el namespace del servicio primero
      const serviceOptions = options
        ? { ...options, lng: lang, ns: serviceName }
        : { lng: lang, ns: serviceName };
      // biome-ignore lint/suspicious/noExplicitAny: i18next types are too complex for this use case
      const resultWithNs = instance.t(key, serviceOptions as any);

      if (typeof resultWithNs === "string" && resultWithNs !== key) {
        return resultWithNs;
      }

      // Si no se encuentra, buscar en common
      const commonOptions = options
        ? { ...options, lng: lang, ns: "common" }
        : { lng: lang, ns: "common" };
      // biome-ignore lint/suspicious/noExplicitAny: i18next types are too complex for this use case
      const resultCommon = instance.t(key, commonOptions as any);

      if (typeof resultCommon === "string") {
        return resultCommon;
      }

      if (process.env.NODE_ENV === "development") {
        console.warn(`Translation missing for key: ${key} in ${serviceName} and common`);
      }

      return key;
    };

    translationFunctionCache.set(cacheKey, safeT);
  }

  serviceInstances.set(serviceName, instance);
  return instance;
};

/**
 * Ejecuta una función dentro de un contexto de locale.
 * Usado por el middleware para establecer el contexto de traducción.
 */
export const runWithLocaleContext = <T>(locale: string, t: TranslationFunction, fn: () => T): T => {
  return localeStorage.run({ locale, t }, fn);
};

/**
 * Obtiene la función de traducción del contexto actual (establecido por el middleware).
 * @throws Error si no hay contexto de locale (fuera de un request HTTP)
 */
export const getCurrentT = (): TranslationFunction => {
  const store = localeStorage.getStore();
  if (!store) {
    throw new Error("No locale context found. Use t.sync() outside of request context.");
  }
  return store.t;
};

/**
 * Obtiene el locale actual del contexto.
 * @throws Error si no hay contexto de locale
 */
export const getCurrentLocale = (): string => {
  const store = localeStorage.getStore();
  if (!store) {
    throw new Error("No locale context found. Use t.sync() outside of request context.");
  }
  return store.locale;
};

/**
 * Obtiene una función de traducción síncrona para un servicio y lenguaje específicos.
 * Usa traducciones precargadas - no requiere contexto de request.
 */
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

/**
 * Limpia el cache de traducciones para un servicio específico o todos.
 * Útil para testing.
 */
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
