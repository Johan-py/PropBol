import { getUsersService, createUserService } from './users.service.js'

export const getUsersController = async () => {
  return getUsersService()
}

export const createUserController = async (data: any) => {
  return createUserService(data)
}
