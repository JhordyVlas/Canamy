import { argon2id, hash } from "argon2";
import { prisma } from "../prisma/client";

const CheckIfUserExists = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user !== null;
};

const HashPassword = async (password: string) => {
  return await hash(password, {
    type: argon2id,
    memoryCost: 65_536,
    timeCost: 2,
    parallelism: 4,
  });
};

const GetUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

interface GetClaimsArgs {
  userId: string;
  selectedTeamId: string | null;
}

const GetClaims = async ({ userId, selectedTeamId }: GetClaimsArgs) => {
  if (!selectedTeamId) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      teams: {
        where: {
          teamId: selectedTeamId,
        },
        include: {
          claims: {
            select: {
              action: true,
              subject: true,
            },
          },
        },
      },
    },
  });

  if (!user) return [];

  return user.teams[0].claims.map((claim) => `${claim.action}:${claim.subject}`);
};

const UserService = {
  CheckIfUserExists,
  HashPassword,
  GetUserByEmail,
  GetClaims,
};

export default UserService;
