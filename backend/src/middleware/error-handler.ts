import type { ErrorRequestHandler } from "express";
import type { ApiErrorResponse } from "../types/error.js";

/**
 * Placeholder global error handler.
 * Maps all errors to the spec error envelope until AppError is introduced (T-019).
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  const code =
    typeof err.code === "string" ? err.code : "INTERNAL_ERROR";
  const message =
    statusCode === 500
      ? "An unexpected error occurred"
      : typeof err.message === "string"
        ? err.message
        : "An error occurred";

  if (statusCode === 500) {
    console.error(err);
  }

  const body: ApiErrorResponse = {
    error: { code, message },
  };

  res.status(statusCode).json(body);
};
