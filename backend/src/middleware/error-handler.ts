import type { ErrorRequestHandler } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import type { ApiErrorResponse } from "../types/error.js";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      res.status(404).json({
        error: { code: "NOT_FOUND", message: "The requested resource was not found" },
      });
      return;
    }

    if (err.code === "P2003") {
      res.status(400).json({
        error: { code: "INVALID_REFERENCE", message: "Referenced resource does not exist" },
      });
      return;
    }
  }

  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  const code = typeof err.code === "string" ? err.code : "INTERNAL_ERROR";
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
