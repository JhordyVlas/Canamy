import log from "encore.dev/log";
import { seedPermissions } from "./permission.seed";

export async function seed() {
  try {
    await Promise.all([seedPermissions()]);
    log.info("Database seeded successfully.");
  } catch (error) {
    log.error("Error seeding database:");
    log.error(error);
  }
}

seed();
