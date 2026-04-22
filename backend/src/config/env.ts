import "dotenv/config";

const requireEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ??
    "http://localhost:5000/api/auth/google/callback",
  DISCORD_CLIENT_ID: requireEnv("DISCORD_CLIENT_ID"),
  DISCORD_CLIENT_SECRET: requireEnv("DISCORD_CLIENT_SECRET"),
  DISCORD_CALLBACK_URL:
    process.env.DISCORD_CALLBACK_URL ??
    "http://localhost:5000/api/auth/discord/callback",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  EMAIL_USER: requireEnv("EMAIL_USER"),
  EMAIL_PASSWORD:
    process.env.EMAIL_PASSWORD ??
    process.env.BREVO_API_KEY ??
    requireEnv("EMAIL_PASSWORD"),
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL ?? "http://localhost:8080",
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ?? "",
  EVOLUTION_INSTANCE: process.env.EVOLUTION_INSTANCE ?? "propbol",
    
};
