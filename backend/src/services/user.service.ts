import { prisma } from "../lib/prisma.js";
import type { UserSummary } from "../types/user.js";

export async function listUsers(): Promise<UserSummary[]> {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}
