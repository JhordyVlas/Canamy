import { APIError, ErrCode } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import t from "~lib/localization/helper.localization";
import type { SupportedLanguage } from "~lib/localization/types";

export interface AuthData {
  userID: string;
  selectedTeamId: string | null;
  name: string;
  surname: string;
  email: string;
  verifiedAt: Date | null;
  language: SupportedLanguage;
}

export const Auth = (): AuthData => {
  const data = getAuthData();

  if (!data) throw new APIError(ErrCode.Unauthenticated, t("unauthenticated"));
  return data;
};
