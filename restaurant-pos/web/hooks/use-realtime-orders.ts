// FILE: web/hooks/use-realtime-orders.ts
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@/hooks/use-supabase-client";

export function useRealtimeOrders(restaurantId: string, onOrderChange?: (orderId: string) => void) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    const channel = client
      .channel(`orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          const payloadRow =
            ((payload.new as { id?: string } | null) ?? (payload.old as { id?: string } | null))?.id ?? null;

          if (payloadRow && onOrderChange) {
            onOrderChange(payloadRow);
          }

          void queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
          void queryClient.invalidateQueries({ queryKey: ["dashboard-snapshot", restaurantId] });
        }
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [client, onOrderChange, queryClient, restaurantId]);
}
