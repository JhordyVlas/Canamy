import type { i18n } from "i18next";

export type TranslationFunction = (
  key: string,
  options?: Record<string, string | number>,
) => string;

export type SyncTranslationFunction = (
  lang: string,
  key: string,
  options?: Record<string, string | number>,
) => string;

export interface LocaleContext {
  locale: string;
  t: TranslationFunction;
}

export type I18nInstance = i18n;
export type InterpolationOptions = Record<string, string | number | boolean>;
export type SupportedLanguage = "es" | "en";

declare global {
  var __CURRENT_SERVICE_NAME__: string | undefined;
}
