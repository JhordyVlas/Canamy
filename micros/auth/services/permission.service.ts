import { prisma } from "../prisma/client";

const GetOwnerPermission = async () => {
  return prisma.permission.findFirst({
    where: {
      action: "manage",
      subject: "team",
    },
  });
};

const PermissionService = {
  GetOwnerPermission,
};

export default PermissionService;
