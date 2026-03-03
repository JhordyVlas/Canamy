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
    const token = await TokenService.GenAuthToken(user.id);
    const session = AuthService.CreateCookie(token);

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
