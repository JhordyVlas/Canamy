import { api } from "encore.dev/api";

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
  (): RegisterResponse => {
    return {
      message: t.auth("internal_error"),
    };
  },
);
