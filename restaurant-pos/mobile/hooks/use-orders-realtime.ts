// FILE: mobile/hooks/use-orders-realtime.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useOrdersRealtime(restaurantId: string | null, onOrderChange?: (orderId: string) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    const channel = supabase
      .channel(`mobile-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          const changedOrderId =
            ((payload.new as { id?: string } | null) ?? (payload.old as { id?: string } | null))?.id ?? null;

          if (changedOrderId && onOrderChange) {
            onOrderChange(changedOrderId);
          }

          void queryClient.invalidateQueries({ queryKey: ["waiter-table-status", restaurantId] });
          void queryClient.invalidateQueries({ queryKey: ["waiter-orders", restaurantId] });
          void queryClient.invalidateQueries({ queryKey: ["delivery-orders", restaurantId] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onOrderChange, queryClient, restaurantId]);
}
