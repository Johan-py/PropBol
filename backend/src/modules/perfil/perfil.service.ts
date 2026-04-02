import {
  findUserWithProfileRepository,
  updateAvatarRepository,
  upsertProfileRepository
} from './perfil.repository.js'

export const getMyProfileService = async (userId: number) => {
  const user = await findUserWithProfileRepository(userId)

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  return {
    id: user.id,
    nombreCompleto: user.perfil?.nombreCompleto ?? '',
    email: user.correo,
    avatar: user.avatar
  }
}

export const updateNameService = async (
  userId: number,
  nombreCompleto: string
) => {
  if (!nombreCompleto || !nombreCompleto.trim()) {
    throw new Error('El nombre completo es obligatorio')
  }

  await upsertProfileRepository(userId, nombreCompleto.trim())

  return getMyProfileService(userId)
}

export const updateAvatarService = async (userId: number, avatar: string) => {
  if (!avatar || !avatar.trim()) {
    throw new Error('El avatar es obligatorio')
  }

  await updateAvatarRepository(userId, avatar)

  return getMyProfileService(userId)
}