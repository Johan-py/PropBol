import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

console.log('Cargando prismaClient.ts...')
console.log('DATABASE_URL existe:', !!process.env.DATABASE_URL)

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)

console.log('Adapter creado')

export const prisma = new PrismaClient({
  adapter
})

console.log('Prisma client creado')
