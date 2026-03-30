import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loginService } from '../../src/modules/auth/auth.service'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const result = await loginService(req.body)
  res.json(result)
}
