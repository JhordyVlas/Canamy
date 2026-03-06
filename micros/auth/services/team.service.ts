import { prisma } from "../prisma/client";
import type { Team } from "../prisma/interfaces";
import type { PaginatedRequest } from "~lib/common/schemas";
import Mapper from "~lib/utils/mapper.util";
import Validate from "~lib/utils/validation.utils";

interface CreateTeamArgs {
  userId: string;
  name: string;
}

const CreateTeam = async ({ name, userId }: CreateTeamArgs) => {
  return await prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name,
      },
    });

    const teamMember = await tx.teamMember.create({
      data: {
        userId,
        teamId: team.id,
      },
    });

    await tx.claim.create({
      data: {
        teamMemberId: teamMember.id,
        action: "owner",
        subject: "team",
      },
    });

    return team;
  });
};

const GetTeamsPaginated = async (userId: string, params: PaginatedRequest) => {
  const where = {
    members: {
      some: {
        userId,
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
