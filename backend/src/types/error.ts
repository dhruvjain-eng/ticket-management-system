/**
 * Standard API error response shape (spec §3.1).
 * Used by middleware and will be used by AppError in a later task.
 */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}
