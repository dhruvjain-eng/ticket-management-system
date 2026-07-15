import type { ApiListResponse, UserSummary } from "@/types";
import { apiGet } from "../api-client";

export async function listUsers(): Promise<UserSummary[]> {
  const response = await apiGet<ApiListResponse<UserSummary>>("/users");
  return response.data;
}
