import type { ApiErrorResponse } from "@/types";
import { ApiError } from "./errors";

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  return baseUrl.replace(/\/$/, "");
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function toApiError(response: Response, body: unknown): ApiError {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    body.error &&
    typeof body.error === "object"
  ) {
    const error = (body as ApiErrorResponse).error;

    return new ApiError(
      response.status,
      error.code ?? "UNKNOWN_ERROR",
      error.message ?? "Request failed",
      error.details,
    );
  }

  return new ApiError(
    response.status,
    "UNKNOWN_ERROR",
    response.statusText || "Request failed",
  );
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        "NETWORK_ERROR",
        "Unable to reach server. Check your connection.",
      );
    }

    throw error;
  }

  const body = await parseJsonBody(response);

  if (!response.ok) {
    throw toApiError(response, body);
  }

  return body as T;
}

export function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: "GET" });
}

export function apiPost<T>(
  path: string,
  data: unknown,
  init?: RequestInit,
): Promise<T> {
  return request<T>(path, {
    ...init,
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiPatch<T>(
  path: string,
  data: unknown,
  init?: RequestInit,
): Promise<T> {
  return request<T>(path, {
    ...init,
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export { getApiBaseUrl };
