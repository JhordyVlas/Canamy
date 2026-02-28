import type { CookieWithOptions } from "encore.dev/api";
import { prisma } from "../prisma/client";
import type { RegisterRequest } from "../schemas/auth.schemas";
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

const AuthService = {
  RegisterUser,
  CreateCookie,
};

export default AuthService;
