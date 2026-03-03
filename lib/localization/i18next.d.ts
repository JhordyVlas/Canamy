import "i18next";

/**
 * Configuración global de i18next para type safety.
 *
 * Para habilitar autocomplete de las keys de traducción en cada servicio,
 * crea un archivo i18next.d.ts en el directorio del microservicio:
 *
 * @example
 * ```ts
 * // micros/auth/i18next.d.ts
 * import "i18next";
 *
 * declare module "i18next" {
 *   interface CustomTypeOptions {
 *     defaultNS: "auth";
 *     resources: {
 *       auth: typeof import("../../resources/locales/en/auth.json");
 *       common: typeof import("../../resources/locales/en/common.json");
 *     };
 *   }
 * }
 * ```
 */
declare module "i18next" {
  interface CustomTypeOptions {
    returnNull: false;
    returnEmptyString: false;
    returnObjects: false;
  }
}
