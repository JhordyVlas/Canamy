import { api } from "encore.dev/api";
import { prisma } from "../prisma/client";
import t from "~lib/localization/helper.localization";

interface RegisterResponse {
  message: string;
}

export const register = api(
  {
    method: "POST",
    path: "/auth/register",
    expose: true,
  },
  async (): Promise<RegisterResponse> => {
    const _user = await prisma.user.create({
      data: {
        email: "vlas@vlas.com",
        fullName: "Vlas",
        password: "123456",
      },
    });

    return {
      message: t.auth("internal_error"),
    };
  },
);
