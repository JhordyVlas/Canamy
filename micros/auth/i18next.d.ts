import "i18next";

/**
 * Type safety para traducciones del servicio auth.
 * Este archivo habilita autocomplete de las keys de traducción.
 *
 * IMPORTANTE: Este archivo debe estar en micros/auth/i18next.d.ts
 *
 * Las traducciones se cargan desde:
 * - resources/locales/en/auth.json (namespace principal)
 * - resources/locales/en/common.json (namespace compartido)
 */

// Importar los tipos de los JSON
type AuthTranslations = typeof import("../../resources/locales/en/auth.json");
type CommonTranslations = typeof import("../../resources/locales/en/common.json");

// Combinar las keys de ambos namespaces
type CombinedTranslations = AuthTranslations & CommonTranslations;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "auth";
    // Usar las traducciones combinadas para que aparezcan todas las keys
    resources: {
      auth: CombinedTranslations;
      common: CombinedTranslations;
    };
  }
}
