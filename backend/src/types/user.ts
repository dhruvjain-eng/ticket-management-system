import type { UserRole } from "../../generated/prisma/client.js";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
