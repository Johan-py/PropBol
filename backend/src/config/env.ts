// backend/src/config/env.ts

import 'dotenv/config'
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL!
}
