import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida')
}

const adapter = new PrismaPg({ connectionString })

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: ['error', 'warn']
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}