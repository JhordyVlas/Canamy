import { verify } from "argon2";
import type { CookieWithOptions } from "encore.dev/api";
import { prisma } from "../prisma/client";
import type { LoginUserRequest, RegisterRequest } from "../schemas/auth.schemas";
import UserService from "./user.service";

const RegisterUser = async (input: RegisterRequest) => {
  return await prisma.$transaction(async (tx) => {
    const password = await UserService.HashPassword(input.password);

    const [user, team] = await Promise.all([
      tx.user.create({
        data: {
          ...input,
          password,
        },
      }),
      tx.team.create({
        data: {
          name: "Default",
        },
      }),
    ]);

    const [teamMember, permission] = await Promise.all([
      tx.teamMember.create({
        data: {
          userId: user.id,
          teamId: team.id,
        },
      }),
      tx.permission.findFirst({
        where: {
          action: "manage",
          subject: "team",
        },
      }),
    ]);

    if (!permission) {
      throw new Error("No permission found");
    }

    const [updatedUser] = await Promise.all([
      tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          selectedTeamId: team.id,
        },
      }),
      tx.access.create({
        data: {
          teamMemberId: teamMember.id,
          permissionId: permission.id,
        },
      }),
    ]);

    return updatedUser;
  });
};

const CreateCookie = (value: string | Record<string, never>): CookieWithOptions<string> => {
  let cookieValue = value;

  if (typeof value !== "string") {
    cookieValue = JSON.stringify(value);
  }

  return {
    value: cookieValue as string,
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
};

const CheckUserCredentials = async ({ email, password }: LoginUserRequest) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) return false;

  const isValid = await verify(user.password, password);
  if (!isValid) return false;

  return user;
};

const ChangeUserPassword = async (userId: string, password: string) => {
  const hashedPassword = await UserService.HashPassword(password);

  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
};

const AuthService = {
  RegisterUser,
  CreateCookie,
  CheckUserCredentials,
  ChangeUserPassword,
};

export default AuthService;
