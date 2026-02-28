import { defineConfig } from "prisma/config";
import authConfig from "./secrets.config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: authConfig.dbUrl(),
  },
});
