// FILE: web/hooks/use-orders.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignDeliveryBoy,
  bulkUpdateOrderStatus,
  getOrderDetails,
  listDeliveryStaff,
  listOrders,
  updateOrderStatus
} from "@/lib/supabase/queries";
import type { OrderStatus } from "@/types/database";
import { useSupabaseClient } from "@/hooks/use-supabase-client";

interface UseOrdersFilters {
  restaurantId: string;
  status: "all" | OrderStatus;
  search: string;
  date?: string;
}

export function useOrders(filters: UseOrdersFilters) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ["orders", filters.restaurantId, filters.status, filters.search, filters.date],
    queryFn: () => listOrders(client, filters),
    enabled: Boolean(filters.restaurantId)
  });
}

export function useDeliveryStaff(restaurantId: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ["delivery-staff", restaurantId],
    queryFn: () => listDeliveryStaff(client, restaurantId),
    enabled: Boolean(restaurantId)
  });
}

export function useOrderDetails(orderId: string | null) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ["order-details", orderId],
    queryFn: () => getOrderDetails(client, orderId ?? ""),
    enabled: Boolean(orderId)
  });
}

export function useOrderMutations(restaurantId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard-snapshot", restaurantId] })
    ]);
  };

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(client, orderId, status),
    onSuccess: invalidate
  });

  const assignDeliveryMutation = useMutation({
    mutationFn: ({ orderId, deliveryId }: { orderId: string; deliveryId: string | null }) =>
      assignDeliveryBoy(client, orderId, deliveryId),
    onSuccess: invalidate
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ orderIds, status }: { orderIds: string[]; status: OrderStatus }) =>
      bulkUpdateOrderStatus(client, orderIds, status),
    onSuccess: invalidate
  });

  return {
    statusMutation,
    assignDeliveryMutation,
    bulkStatusMutation
  };
}
