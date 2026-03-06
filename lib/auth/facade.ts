import { APIError, ErrCode } from "encore.dev/api";
import type { Action, Subject } from "~/auth/prisma/interfaces";
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
  claims: string[];
}

export const Auth = (): AuthData => {
  const data = getAuthData();

  if (!data) throw new APIError(ErrCode.Unauthenticated, t("unauthenticated"));
  return data;
};

type Claim = `${Action}:${Subject}`;

export const Can = (claim: Claim) => {
  const user = Auth();

  if (
    user.claims.includes("owner:team") ||
    user.claims.includes(`manage:${claim.split(":")[1]}`) ||
    user.claims.includes(claim)
  ) {
    return;
  }

  throw new APIError(ErrCode.Unauthenticated, t("unauthenticated"));
};
