import { api } from "encore.dev/api";
import type { Team } from "../prisma/interfaces";
import type { CreateTeamRequest } from "../schemas/team.schemas";
import TeamService from "../services/team.service";
import { Auth } from "~lib/auth/facade";
import type { PaginatedRequest, PaginatedResponse } from "~lib/common/schemas";

export const getTeamsPaginated = api(
  { method: "GET", path: "/auth/teams", auth: true },
  async (params: PaginatedRequest): Promise<PaginatedResponse<Team>> => {
    return await TeamService.GetTeamsPaginated(Auth().userID, params);
  },
);

export const createTeam = api(
  { method: "POST", path: "/auth/teams", auth: true },
  async (input: CreateTeamRequest): Promise<Team> => {
    return await TeamService.CreateTeam({
      name: input.name,
      userId: Auth().userID,
    });
  },
);
