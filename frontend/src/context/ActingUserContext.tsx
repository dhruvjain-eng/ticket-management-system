"use client";

import type { UserSummary } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "acting-user-id";

interface ActingUserContextValue {
  actingUserId: string | null;
  setActingUserId: (userId: string) => void;
  resolveActingUser: (users: UserSummary[]) => UserSummary | null;
}

const ActingUserContext = createContext<ActingUserContextValue | null>(null);

export function ActingUserProvider({ children }: { children: React.ReactNode }) {
  const [actingUserId, setActingUserIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setActingUserIdState(stored);
    }
  }, []);

  const setActingUserId = useCallback((userId: string) => {
    setActingUserIdState(userId);
    window.localStorage.setItem(STORAGE_KEY, userId);
  }, []);

  const resolveActingUser = useCallback(
    (users: UserSummary[]) => {
      if (users.length === 0) {
        return null;
      }

      if (actingUserId) {
        const match = users.find((user) => user.id === actingUserId);
        if (match) {
          return match;
        }
      }

      return users[0] ?? null;
    },
    [actingUserId],
  );

  const value = useMemo(
    () => ({ actingUserId, setActingUserId, resolveActingUser }),
    [actingUserId, setActingUserId, resolveActingUser],
  );

  return (
    <ActingUserContext.Provider value={value}>{children}</ActingUserContext.Provider>
  );
}

export function useActingUser(): ActingUserContextValue {
  const context = useContext(ActingUserContext);

  if (!context) {
    throw new Error("useActingUser must be used within ActingUserProvider");
  }

  return context;
}
