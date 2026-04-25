// FILE: mobile/app/(waiter)/orders.tsx
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonList } from "@/components/skeleton-list";
import { StatusChip } from "@/components/status-chip";
import { useDeliveryOrderDetails } from "@/hooks/use-delivery";
import { useOrdersRealtime } from "@/hooks/use-orders-realtime";
import { useWaiterOrders } from "@/hooks/use-waiter";
import { ago, currency } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export default function WaiterOrdersScreen() {
  const params = useLocalSearchParams<{ table?: string }>();
  const tableFilter = params.table ? Number(params.table) : null;

  const profile = useAuthStore((state) => state.profile);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const ordersQuery = useWaiterOrders(profile?.id ?? null, profile?.restaurant_id ?? null);
  const detailsQuery = useDeliveryOrderDetails(selectedOrderId);

  useOrdersRealtime(profile?.restaurant_id ?? null);

  const orders = (ordersQuery.data ?? []).filter((order) =>
    tableFilter ? order.table_number === tableFilter : true
  );

  return (
    <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="mt-2 text-2xl font-interSemi text-primary">My Orders</Text>
        <Text className="mb-3 mt-1 text-sm text-neutral-500">Live orders created by you today.</Text>

        {ordersQuery.isLoading ? (
          <SkeletonList rows={6} />
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <Pressable
              key={order.id}
              className="mb-3 rounded-xl border border-border bg-card p-3"
              onPress={() => setSelectedOrderId(order.id)}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-interSemi text-primary">Table {order.table_number ?? "-"}</Text>
                <StatusChip status={order.status} />
              </View>
              <Text className="mt-2 text-sm text-neutral-500">{ago(order.created_at)} • {order.itemCount} items</Text>
              <Text className="mt-1 text-sm font-interSemi text-primary">{currency(Number(order.total_amount))}</Text>
            </Pressable>
          ))
        ) : (
          <View className="rounded-xl border border-border bg-card p-4">
            <Text className="text-sm text-neutral-600">No orders found.</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={Boolean(selectedOrderId)} transparent animationType="slide" onRequestClose={() => setSelectedOrderId(null)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[80%] rounded-t-3xl bg-appbg p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-interSemi text-primary">Order Detail</Text>
              <Pressable onPress={() => setSelectedOrderId(null)}>
                <Text className="text-sm text-neutral-500">Close</Text>
              </Pressable>
            </View>

            {detailsQuery.isLoading ? (
              <View className="mt-3"><SkeletonList rows={3} /></View>
            ) : detailsQuery.data ? (
              <ScrollView className="mt-3" contentContainerStyle={{ paddingBottom: 8 }}>
                {detailsQuery.data.items.map((item) => (
                  <View key={item.id} className="mb-2 rounded-xl border border-border bg-card p-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-interSemi text-primary">{item.name}</Text>
                      <Text className="text-sm text-neutral-600">{item.quantity} × {currency(item.price)}</Text>
                    </View>
                    {item.notes ? <Text className="mt-1 text-xs text-neutral-500">{item.notes}</Text> : null}
                  </View>
                ))}

                {detailsQuery.data.order.notes ? (
                  <Text className="mt-2 text-sm text-neutral-600">Notes: {detailsQuery.data.order.notes}</Text>
                ) : null}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
