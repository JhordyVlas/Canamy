import { APIError, api } from "encore.dev/api";
import type {
  LoginResponse,
  LoginUserRequest,
  RegisterRequest,
  RegisterResponse,
} from "../schemas/auth.schemas";
import AuthService from "../services/auth.service";
import TokenService from "../services/token.service";
import UserService from "../services/user.service";
import { mail } from "~encore/clients";
import { Auth } from "~lib/auth/auth";
import type { DefaultResponse } from "~lib/common/schemas";
import t from "~lib/localization/helper.localization";

export const register = api(
  {
    method: "POST",
    path: "/auth/register",
    expose: true,
  },
  async (request: RegisterRequest): Promise<RegisterResponse> => {
    if (await UserService.CheckIfUserExists(request.email)) {
      throw APIError.alreadyExists(t("internal_error"));
    }

    const user = await AuthService.RegisterUser(request);

    const [token, code] = await Promise.all([
      TokenService.GenAuthToken(user.id),
      TokenService.GenAuthToken(user.id, 3, 3),
    ]);

    const session = AuthService.CreateCookie(token);

    await mail.verifyMail({
      code,
      email: request.email,
      language: "en",
      name: request.name,
    });

    return {
      ...user,
      session,
    };
  },
);

export const login = api(
  { method: "POST", path: "/auth/login", expose: true },
  async (request: LoginUserRequest): Promise<LoginResponse> => {
    const user = await AuthService.CheckUserCredentials(request);
    if (!user) throw APIError.unauthenticated(t("unauthenticated"));

    const token = await TokenService.GenAuthToken(user.id);
    const session = AuthService.CreateCookie(token);

    return {
      ...user,
      session,
    };
  },
);

export const logout = api(
  {
    method: "DELETE",
    path: "/auth/logout",
    expose: true,
    auth: true,
  },
  async (): Promise<DefaultResponse> => {
    const user = Auth();
    await TokenService.RevokeAuthTokens(user.userID);

    return {
      message: t("logout_success"),
    };
  },
);

export const resendVerificationMail = api(
  { expose: true, auth: true, method: "POST", path: "/auth/resend-verification-mail" },
  async (): Promise<DefaultResponse> => {
    const user = Auth();
    const code = await TokenService.GenAuthToken(user.userID, 3, 3);

    await mail.verifyMail({
      code,
      email: user.email,
      language: user.language,
      name: user.name,
    });

    return {
      message: t("operation_success"),
    };
  },
);
