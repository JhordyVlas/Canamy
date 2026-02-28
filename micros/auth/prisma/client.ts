import { PrismaPg } from "@prisma/adapter-pg";
import authConfig from "../secrets.config";
import { PrismaClient } from "./generated/client";

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: authConfig.dbUrl() }),
});
