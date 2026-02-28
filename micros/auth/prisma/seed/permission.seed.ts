import { prisma } from "../client";

export async function seedPermissions() {
  await prisma.permission.createMany({
    data: [
      {
        action: "manage",
        subject: "team",
      },
    ],
  });
}
