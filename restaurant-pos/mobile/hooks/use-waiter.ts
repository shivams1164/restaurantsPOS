// FILE: mobile/hooks/use-waiter.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMenuCategories,
  fetchOrderItems,
  fetchTableStatus,
  fetchWaiterMenu,
  fetchWaiterOrdersToday,
  placeWaiterOrder
} from "@/lib/queries";
import { supabase } from "@/lib/supabase";

export function useTableStatus(restaurantId: string | null, tableCount: number) {
  return useQuery({
    queryKey: ["waiter-table-status", restaurantId, tableCount],
    queryFn: () => fetchTableStatus(supabase, restaurantId ?? "", tableCount),
    enabled: Boolean(restaurantId)
  });
}

export function useWaiterMenu(restaurantId: string | null, search: string, category: string) {
  return useQuery({
    queryKey: ["waiter-menu", restaurantId, search, category],
    queryFn: () => fetchWaiterMenu(supabase, restaurantId ?? "", search, category),
    enabled: Boolean(restaurantId)
  });
}

export function useWaiterMenuCategories(restaurantId: string | null) {
  return useQuery({
    queryKey: ["waiter-menu-categories", restaurantId],
    queryFn: () => fetchMenuCategories(supabase, restaurantId ?? ""),
    enabled: Boolean(restaurantId)
  });
}

export function useWaiterOrders(waiterId: string | null, restaurantId: string | null) {
  return useQuery({
    queryKey: ["waiter-orders", restaurantId, waiterId],
    queryFn: async () => {
      const orders = await fetchWaiterOrdersToday(supabase, waiterId ?? "", restaurantId ?? "");
      const items = await fetchOrderItems(
        supabase,
        orders.map((order) => order.id)
      );

      const countByOrder = new Map<string, number>();
      for (const item of items) {
        countByOrder.set(item.order_id, (countByOrder.get(item.order_id) ?? 0) + item.quantity);
      }

      return orders.map((order) => ({
        ...order,
        itemCount: countByOrder.get(order.id) ?? 0
      }));
    },
    enabled: Boolean(waiterId && restaurantId)
  });
}

export function usePlaceWaiterOrder(waiterId: string | null, restaurantId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: {
      tableNumber: number;
      notes?: string;
      items: Array<{ menuItemId: string; quantity: number; price: number; notes?: string }>;
    }) => placeWaiterOrder(supabase, waiterId ?? "", restaurantId ?? "", values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["waiter-table-status", restaurantId] }),
        queryClient.invalidateQueries({ queryKey: ["waiter-orders", restaurantId, waiterId] })
      ]);
    }
  });
}
