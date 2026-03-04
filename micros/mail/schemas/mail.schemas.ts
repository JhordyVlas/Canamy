import type { SupportedLanguage } from "~lib/localization/types";

export interface EmailData {
  email: string;
  language: SupportedLanguage;
}

export interface VerifyEmailData extends EmailData {
  name: string;
  code: string;
}

export interface ForgotPasswordData extends EmailData {
  name: string;
  code: string;
}
