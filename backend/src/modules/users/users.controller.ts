import { getUsersService, createUserService } from './users.service.ts'

export const getUsersController = async () => {
  return getUsersService()
}

export const createUserController = async (data: any) => {
  return createUserService(data)
}
