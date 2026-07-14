import type { Response } from "express";

type ValidatedKey = "body" | "query" | "params";

export function getValidated<T>(res: Response, key: ValidatedKey): T {
  const value = res.locals.validated?.[key];
  if (value === undefined) {
    throw new Error(`Validated ${key} was not set by middleware`);
  }
  return value as T;
}
