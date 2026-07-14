import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: Number.parseInt(getEnv("PORT", "3001"), 10),
  corsOrigin: getEnv("CORS_ORIGIN", "http://localhost:3000"),
  databaseUrl: process.env.DATABASE_URL,
} as const;
