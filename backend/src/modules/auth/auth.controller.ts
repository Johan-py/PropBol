import { loginService } from './auth.service.js'

export const loginController = async (body: any) => {
  return loginService(body)
}
