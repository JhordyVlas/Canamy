import { APIError, type Cookie, ErrCode, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import TokenService from "./services/token.service";
import type { AuthData } from "~lib/auth/auth";
import t from "~lib/localization/helper.localization";

interface AuthParams {
  session: Cookie<"session">;
}

export const authGateway = authHandler<AuthParams, AuthData>(async ({ session }) => {
  const user = await TokenService.ValidateToken(session.value);
  if (!user) throw new APIError(ErrCode.Unauthenticated, t("unauthenticated"));

  return {
    userID: user.id,
    name: user.name,
    surname: user.surname,
    selectedTeamId: user.selectedTeamId,
    email: user.email,
    verifiedAt: user.verifiedAt,
    language: user.language,
  };
});

export const gateway = new Gateway({
  authHandler: authGateway,
});
