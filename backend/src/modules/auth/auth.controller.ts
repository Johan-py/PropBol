import { loginService } from './auth.service'
type payload = {
  name: string,
  email: string
}
export const loginController = async (body: payload) => {
  return loginService(body)
}
