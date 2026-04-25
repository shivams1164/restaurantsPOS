// FILE: mobile/hooks/use-delivery.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDeliveryOrderDetails, fetchDeliveryOrders, updateDeliveryOrderStatus } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import type { OrderStatus } from "@/types/database";

export function useDeliveryOrders(deliveryId: string | null, restaurantId: string | null) {
  return useQuery({
    queryKey: ["delivery-orders", restaurantId, deliveryId],
    queryFn: () => fetchDeliveryOrders(supabase, deliveryId ?? "", restaurantId ?? ""),
    enabled: Boolean(deliveryId && restaurantId)
  });
}

export function useDeliveryOrderDetails(orderId: string | null) {
  return useQuery({
    queryKey: ["delivery-order-details", orderId],
    queryFn: () => fetchDeliveryOrderDetails(supabase, orderId ?? ""),
    enabled: Boolean(orderId)
  });
}

export function useDeliveryStatusMutation(restaurantId: string | null, deliveryId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Extract<OrderStatus, "picked" | "delivered"> }) =>
      updateDeliveryOrderStatus(supabase, orderId, status),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["delivery-orders", restaurantId, deliveryId] }),
        queryClient.invalidateQueries({ queryKey: ["delivery-order-details", variables.orderId] })
      ]);
    }
  });
}
