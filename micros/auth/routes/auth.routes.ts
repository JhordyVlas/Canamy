import { APIError, api } from "encore.dev/api";
import type { RegisterRequest, RegisterResponse } from "../schemas/auth.schemas";
import AuthService from "../services/auth.service";
import TokenService from "../services/token.service";
import UserService from "../services/user.service";
import t from "~lib/localization/helper.localization";

export const register = api(
  {
    method: "POST",
    path: "/auth/register",
    expose: true,
  },
  async (request: RegisterRequest): Promise<RegisterResponse> => {
    if (await UserService.CheckIfUserExists(request.email)) {
      throw APIError.alreadyExists(t.auth("email_already_exists"));
    }

    const user = await AuthService.RegisterUser(request);
    const token = await TokenService.GenAuthToken(user.id);
    const session = AuthService.CreateCookie(token);

    return {
      user,
      session,
    };
  },
);
