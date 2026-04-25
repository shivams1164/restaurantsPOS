// FILE: web/components/providers/session-provider.tsx
"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { Tables } from "@/types/database";

interface SessionContextValue {
  profile: Pick<Tables<"profiles">, "id" | "name" | "email" | "role" | "restaurant_id" | "avatar_url">;
  restaurant: Pick<Tables<"restaurants">, "id" | "name" | "address" | "phone" | "logo_url" | "operating_hours">;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children, value }: { children: ReactNode; value: SessionContextValue }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used inside SessionProvider");
  }
  return context;
}
