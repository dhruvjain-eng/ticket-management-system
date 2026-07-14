import type { RequestHandler } from "express";

/**
 * Catches requests that do not match any mounted route.
 * Must be registered after all routes and before the error handler (spec §8.4).
 */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found",
    },
  });
};
