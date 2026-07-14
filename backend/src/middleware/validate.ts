import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

function formatZodErrors(error: ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, res, next) => {
    try {
      res.locals.validated ??= {};

      if (schemas.params) {
        res.locals.validated.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        res.locals.validated.query = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        res.locals.validated.body = schemas.body.parse(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(400, "VALIDATION_ERROR", "Validation failed", formatZodErrors(error)),
        );
        return;
      }
      next(error);
    }
  };
}
