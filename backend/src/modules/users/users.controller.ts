import { getUsersService, createUserService } from './users.service'

export const getUsersController = async () => {
  return getUsersService()
}

export const createUserController = async (data: any) => {
  return createUserService(data)
}
