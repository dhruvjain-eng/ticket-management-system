export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    count: number;
  };
}
