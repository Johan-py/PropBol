<<<<<<< HEAD
import { prisma } from "../../lib/prisma.client.js";

export type SecurityUserPasswordRecord = {
  id: number;
  password: string | null;
};

export const findUserPasswordByIdRepository = async (
  userId: number,
=======
import { prisma } from '../../lib/prisma.client.js'

export type SecurityUserPasswordRecord = {
  id: number
  password: string | null
}

export const findUserPasswordByIdRepository = async (
  userId: number
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
): Promise<SecurityUserPasswordRecord | null> => {
  return await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
<<<<<<< HEAD
      password: true,
    },
  });
};

export const deactivateUserAccountRepository = async (
  userId: number,
): Promise<void> => {
=======
      password: true
    }
  })
}

export const deactivateUserAccountRepository = async (userId: number): Promise<void> => {
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: userId },
      data: {
        activo: false,
<<<<<<< HEAD
        desactivado_en: new Date(),
      },
=======
        desactivado_en: new Date()
      }
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
    }),
    prisma.sesion.updateMany({
      where: {
        usuarioId: userId,
<<<<<<< HEAD
        estado: true,
      },
      data: {
        estado: false,
      },
    }),
  ]);
};
=======
        estado: true
      },
      data: {
        estado: false
      }
    })
  ])
}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
