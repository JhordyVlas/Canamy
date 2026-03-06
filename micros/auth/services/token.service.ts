import crypto from "node:crypto";
import { prisma } from "../prisma/client";
import type { Prisma } from "../prisma/generated/client";
import authConfig from "../secrets.config";
import Generate from "~lib/utils/gen.util";

interface GenPlainTokenArgs {
  min: number;
  max: number;
}

const genPlainToken = ({ min, max }: GenPlainTokenArgs) => {
  const salt = Generate.Num(min, max);
  return crypto.randomBytes(salt).toString("hex");
};

const genHashedToken = (plainToken: string) => {
  return crypto.createHmac("sha256", authConfig.secretKey()).update(plainToken).digest("hex");
};

interface GenAuthTokenArgs {
  userId: string;
  min?: number;
  max?: number;
}

const GenAuthToken = async ({ userId, min = 10, max = 30 }: GenAuthTokenArgs) => {
  const plainToken = genPlainToken({ min, max });
  const hashedToken = genHashedToken(plainToken);

  await prisma.token.create({
    data: {
      userId,
      value: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    },
  });

  return plainToken;
};

interface ValidateTokenArgs {
  plainToken: string;
  userId?: string;
}

const ValidateToken = async ({ plainToken, userId }: ValidateTokenArgs) => {
  const hashedToken = genHashedToken(plainToken);

  const where: Prisma.TokenWhereInput = {
    value: hashedToken,
  };

  if (userId) {
    where.userId = userId;
  }

  const token = await prisma.token.findFirst({
    where,
    include: {
      user: true,
    },
  });

  if (!token) return false;
  if (new Date(token.expiresAt) < new Date()) return false;

  return token.user;
};

const RevokeAuthTokens = async (userId: string) => {
  await prisma.token.deleteMany({
    where: {
      userId,
    },
  });
};

const DeleteExpiredTokens = async () => {
  return await prisma.token.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

const TokenService = {
  GenAuthToken,
  ValidateToken,
  RevokeAuthTokens,
  DeleteExpiredTokens,
};

export default TokenService;
