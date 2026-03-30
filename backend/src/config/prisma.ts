import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('Falta DATABASE_URL')
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({ adapter })