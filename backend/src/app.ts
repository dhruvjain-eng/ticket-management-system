import cors from "cors";
import express, { type Express } from "express";
import { apiRouter } from "./routes/index.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";

/**
 * Express application factory.
 * Exported without listen() so Supertest can import it in later tasks (spec §8.4).
 */
export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
    }),
  );

  app.use(express.json());

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
