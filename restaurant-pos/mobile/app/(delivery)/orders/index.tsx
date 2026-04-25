// FILE: mobile/app/(delivery)/orders/index.tsx
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonList } from "@/components/skeleton-list";
import { StatusChip } from "@/components/status-chip";
import { useDeliveryOrders } from "@/hooks/use-delivery";
import { useOrdersRealtime } from "@/hooks/use-orders-realtime";
import { ago, currency } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export default function DeliveryOrdersScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);

  const ordersQuery = useDeliveryOrders(profile?.id ?? null, profile?.restaurant_id ?? null);

  useOrdersRealtime(profile?.restaurant_id ?? null);

  const activeCount = useMemo(() => (ordersQuery.data ?? []).length, [ordersQuery.data]);

  return (
    <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={ordersQuery.isRefetching} onRefresh={() => void ordersQuery.refetch()} />}
      >
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-2xl font-interSemi text-primary">Your deliveries</Text>
          <View className="rounded-full bg-accent px-3 py-1">
            <Text className="text-xs font-interSemi text-primary">{activeCount} active</Text>
          </View>
        </View>

        {ordersQuery.isLoading ? (
          <View className="mt-3"><SkeletonList rows={5} /></View>
        ) : (ordersQuery.data ?? []).length > 0 ? (
          (ordersQuery.data ?? []).map((order) => (
            <Pressable
              key={order.id}
              className="mt-3 rounded-xl border border-border bg-card p-3"
              onPress={() => router.push(`/(delivery)/orders/${order.id}`)}
            >
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text className="text-base font-interSemi text-primary">{order.customer_name ?? "Customer"}</Text>
                  <Text className="mt-1 text-sm text-neutral-500">{order.customer_address ?? "No address"}</Text>
                </View>
                <StatusChip status={order.status} />
              </View>

              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-sm text-neutral-500">Assigned {ago(order.updated_at)}</Text>
                <Text className="text-sm font-interSemi text-primary">{currency(Number(order.total_amount))}</Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View className="mt-3 rounded-xl border border-border bg-card p-4">
            <Text className="text-sm text-neutral-600">No assigned deliveries right now.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
