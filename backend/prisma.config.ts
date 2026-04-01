import { defineConfig, env } from '@prisma/config'
import 'dotenv/config'

console.log('DATABASE_URL:', process.env.DATABASE_URL)

export default defineConfig({
  schema: './prisma/schema.prisma',

  datasource: {
    url: env('DATABASE_URL'),        // ← forma recomendada
  },

  // Opcional: configura la carpeta de migraciones
  migrations: {
    path: './prisma/migrations',     // si quieres especificar
  }
})