import { prisma } from "../../lib/prisma.client.js";

export type SecurityUserPasswordRecord = {
  id: number;
  password: string | null;
};

export const findUserPasswordByIdRepository = async (
  userId: number,
): Promise<SecurityUserPasswordRecord | null> => {
  return await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
    },
  });
};
