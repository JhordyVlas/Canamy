import log from "encore.dev/log";
import { createTranslationFunction, getCurrentT } from "./i18n";

type ServiceKey = "auth" | "mail";

const createT = (
  service: ServiceKey,
  key: string,
  options?: Record<string, string | number>,
): string => {
  try {
    const contextT = getCurrentT();
    return contextT(key, options);
  } catch {
    log.error(`Translation context not available for ${service}.${key}`);
    return key;
  }
};

const createTAsync = async (
  service: ServiceKey,
  key: string,
  lang: string,
  options?: Record<string, string | number>,
): Promise<string> => {
  const specificT = await createTranslationFunction(service, lang);
  return specificT(key, options);
};

const t = {
  auth: (key: string, options?: Record<string, string | number>) => createT("auth", key, options),
  mail: (key: string, options?: Record<string, string | number>) => createT("mail", key, options),
  withLang: {
    auth: async (key: string, lang: string, options?: Record<string, string | number>) =>
      createTAsync("auth", key, lang, options),
    mail: async (key: string, lang: string, options?: Record<string, string | number>) =>
      createTAsync("mail", key, lang, options),
  },
};

export default t;
