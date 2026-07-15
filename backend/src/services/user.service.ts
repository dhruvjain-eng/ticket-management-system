import { prisma } from "../lib/prisma.js";
import type { UserSummary } from "../types/user.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

export async function listUsers(): Promise<UserSummary[]> {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: userSelect,
  });
}

export async function getUserById(userId: string): Promise<UserSummary | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });
}
