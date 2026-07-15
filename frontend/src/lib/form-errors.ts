import { ApiError } from "@/lib/errors";

export type FieldErrors = Record<string, string>;

export function mapApiDetailsToFieldErrors(
  details?: Array<{ field: string; message: string }>,
): FieldErrors {
  if (!details) {
    return {};
  }

  return details.reduce<FieldErrors>((acc, detail) => {
    acc[detail.field] = detail.message;
    return acc;
  }, {});
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
}
