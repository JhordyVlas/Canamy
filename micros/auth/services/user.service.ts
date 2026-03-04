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

const UserService = {
  CheckIfUserExists,
  HashPassword,
  GetUserByEmail,
};

export default UserService;
