import { generateToken } from '../../utils/jwt.ts'
import { findUser } from './auth.repository.ts'

export const loginService = async ({ email }: { email: string }) => {
  const user = await findUser(email)

  if (!user) {
    throw new Error('User not found')
  }

  const token = generateToken(user)

  return { user, token }
}
