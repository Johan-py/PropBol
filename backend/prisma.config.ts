import { defineConfig } from '@prisma/config'
import 'dotenv/config'

console.log('DATABASE_URL:', process.env.DATABASE_URL)

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!
  },
  migrate: {
    adapter: async () => {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      return new PrismaPg({ connectionString: process.env.DATABASE_URL! })
    }
  }
})