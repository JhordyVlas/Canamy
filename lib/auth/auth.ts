import { APIError, ErrCode } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import t from "~lib/localization/helper.localization";

export interface AuthData {
  userID: string;
  selectedTeamId: string | null;
  name: string;
  surname: string;
  email: string;
  verifiedAt: Date | null;
}

export const Auth = (): AuthData => {
  const data = getAuthData();

  if (!data) throw new APIError(ErrCode.Unauthenticated, t.auth("unauthenticated"));
  return data;
};
