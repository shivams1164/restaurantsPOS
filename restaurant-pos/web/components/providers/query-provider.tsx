// FILE: web/components/providers/query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }): JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20_000,
            refetchOnWindowFocus: false,
            retry: 1
          },
          mutations: {
            retry: 1
          }
        }
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
