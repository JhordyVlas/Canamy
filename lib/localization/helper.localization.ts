import log from "encore.dev/log";
import type { TFunction } from "i18next";
import { getCurrentT, getSyncTranslation } from "./i18n";
import type { SupportedLanguage } from "./types";

/**
 * Tipo que extiende TFunction con el método sync
 */
type ExtendedTFunction = TFunction & {
  sync: (lang: SupportedLanguage, key: string, options?: Record<string, string | number>) => string;
};

/**
 * Función de traducción contextual.
 * Usa el idioma del request actual (establecido por el middleware).
 * Solo funciona dentro del contexto de un request HTTP.
 *
 * @example
 * ```ts
 * // Dentro de un endpoint con middleware de localización
 * const message = t("email_already_exists");
 * const greeting = t("welcome", { name: "Vlas" });
 * ```
 */
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

/**
 * Función de traducción síncrona sin contexto.
 * Requiere especificar el idioma explícitamente.
 * Útil para emails, jobs en background, o cualquier código fuera de requests HTTP.
 *
 * Nota: El servicio debe estar configurado con createLocalizationMiddleware
 * para que las traducciones estén precargadas.
 *
 * @example
 * ```ts
 * // En un job o función de email
 * const emailSubject = t.sync("es", "welcome_email_subject", { name: "Vlas" });
 * const emailBody = t.sync("en", "welcome_email_body");
 * ```
 */
t.sync = (
  lang: SupportedLanguage,
  key: string,
  options?: Record<string, string | number>,
): string => {
  try {
    // El nombre del servicio se obtiene del contexto de módulo
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
