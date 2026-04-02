import { prisma } from '../../lib/prisma.js'

export const findUserWithProfileRepository = async (userId: number) => {
  return prisma.usuario.findUnique({
    where: { id: userId },
    include: { perfil: true }
  })
}

export const updateAvatarRepository = async (userId: number, avatar: string) => {
  return prisma.usuario.update({
    where: { id: userId },
    data: { avatar }
  })
}

export const upsertProfileRepository = async (
  userId: number,
  nombreCompleto: string
) => {
  const perfil = await prisma.perfil.findUnique({
    where: { usuarioId: userId }
  })

  if (perfil) {
    return prisma.perfil.update({
      where: { usuarioId: userId },
      data: { nombreCompleto }
    })
  }

  return prisma.perfil.create({
    data: {
      usuarioId: userId,
      nombreCompleto
    }
  })
}