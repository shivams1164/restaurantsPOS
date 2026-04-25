// FILE: web/hooks/use-dashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSnapshot } from "@/lib/supabase/queries";
import { useSupabaseClient } from "@/hooks/use-supabase-client";

export function useDashboard(restaurantId: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ["dashboard-snapshot", restaurantId],
    queryFn: () => getDashboardSnapshot(client, restaurantId),
    enabled: Boolean(restaurantId)
  });
}
