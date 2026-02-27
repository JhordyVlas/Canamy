import { PrismaPg } from "@prisma/adapter-pg";

import { authDB } from "./database";
import { PrismaClient } from "./generated/client";

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: authDB.connectionString }),
});
