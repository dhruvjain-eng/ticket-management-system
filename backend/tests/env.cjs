const { config } = require("dotenv");
const { resolve } = require("node:path");

config({ path: resolve(process.cwd(), ".env.test"), override: true });
config({ path: resolve(process.cwd(), ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for integration tests");
}
