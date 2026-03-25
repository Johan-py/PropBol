import { loginService } from './auth.service.ts'

export const loginController = async (body: any) => {
  return loginService(body)
}
