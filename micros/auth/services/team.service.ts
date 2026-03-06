import { prisma } from "../prisma/client";
import type { Team } from "../prisma/interfaces";
import { Auth } from "~lib/auth/auth";
import type { PaginatedRequest } from "~lib/common/schemas";
import Mapper from "~lib/utils/mapper.util";
import Validate from "~lib/utils/validation.utils";

const CreateTeam = async (name: string) => {
  const user = Auth();

  return await prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name,
      },
    });

    const [teamMember, permission] = await Promise.all([
      tx.teamMember.create({
        data: {
          userId: user.userID,
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

    await tx.access.create({
      data: {
        teamMemberId: teamMember.id,
        permissionId: permission.id,
      },
    });

    return team;
  });
};

const GetTeamsPaginated = async (params: PaginatedRequest) => {
  const user = Auth();

  const where = {
    members: {
      some: {
        userId: user.userID,
      },
    },
  };

  const opts = Validate.PaginationParams(["id", "name", "createdAt"], params);

  const [teams, totalTeams] = await prisma.$transaction([
    prisma.team.findMany({
      where,
      orderBy: {
        [opts.orderBy]: opts.orderDir,
      },
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
    }),
    prisma.team.count({ where }),
  ]);

  return Mapper.PaginationData<Team>({
    data: teams,
    count: totalTeams,
    params: opts,
  });
};

const TeamService = {
  CreateTeam,
  GetTeamsPaginated,
};

export default TeamService;
