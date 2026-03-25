import { generateToken } from '../../utils/jwt'
import { findUser } from './auth.repository'

export const loginService = async ({ email }: { email: string }) => {
  const user = await findUser(email)

  if (!user) {
    throw new Error('User not found')
  }

  const token = generateToken(user)

  return { user, token }
}
