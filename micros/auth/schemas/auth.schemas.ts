import type { Cookie } from "encore.dev/api";
import type { IsEmail, MinLen } from "encore.dev/validate";
import type { Language, User } from "../prisma/interfaces";

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string & IsEmail;
  password: string & MinLen<8>;
  language?: Language;
}

interface SerializedUser extends Omit<User, "password" | "id" | "selectedTeamId"> {}

export interface RegisterResponse extends SerializedUser {
  session: Cookie<"session">;
}
