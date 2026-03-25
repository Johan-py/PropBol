import { loginService } from './auth.service'

export const loginController = async (body: any) => {
  return loginService(body)
}
