import { getUsersRepository, createUserRepository } from './users.repository.js'

export const getUsersService = async () => {
  return getUsersRepository()
}

export const createUserService = async (data: any) => {
  // 🔥 lógica de negocio (validaciones, reglas, etc.)
  if (!data.name) {
    throw new Error('Name is required')
  }

  return createUserRepository(data)
}
