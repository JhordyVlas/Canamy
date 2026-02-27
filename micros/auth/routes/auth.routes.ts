import { api } from "encore.dev/api";

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
      message: "Hello World",
    };
  },
);
