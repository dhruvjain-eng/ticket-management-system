"use client";

import { ActingUserProvider } from "@/context/ActingUserContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ActingUserProvider>{children}</ActingUserProvider>;
}
