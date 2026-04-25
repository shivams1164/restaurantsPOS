// FILE: mobile/app/(delivery)/orders/[id].tsx
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useMemo, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonList } from "@/components/skeleton-list";
import { StatusChip } from "@/components/status-chip";
import { useDeliveryOrderDetails, useDeliveryStatusMutation } from "@/hooks/use-delivery";
import { currency } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth-store";
import type { OrderStatus } from "@/types/database";

export default function DeliveryOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAuthStore((state) => state.profile);
  const router = useRouter();

  const detailsQuery = useDeliveryOrderDetails(id ?? null);
  const statusMutation = useDeliveryStatusMutation(profile?.restaurant_id ?? null, profile?.id ?? null);

  const [confirmStatus, setConfirmStatus] = useState<Extract<OrderStatus, "picked" | "delivered"> | null>(null);

  const order = detailsQuery.data?.order;
  const items = detailsQuery.data?.items ?? [];

  const canMarkDelivered = useMemo(() => order?.status === "picked", [order?.status]);

  const openMaps = async () => {
    if (!order?.customer_address) {
      showToast("Address is unavailable");
      return;
    }

    const encoded = encodeURIComponent(order.customer_address);
    const mapUrl = Platform.select({
      ios: `http://maps.apple.com/?q=${encoded}`,
      android: `geo:0,0?q=${encoded}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encoded}`
    });

    if (mapUrl) {
      await Linking.openURL(mapUrl);
    }
  };

  const makeCall = async () => {
    if (!order?.customer_phone) {
      showToast("Phone number is unavailable");
      return;
    }

    await Linking.openURL(`tel:${order.customer_phone}`);
  };

  const updateStatus = async () => {
    if (!confirmStatus || !id) {
      return;
    }

    try {
      await statusMutation.mutateAsync({ orderId: id, status: confirmStatus });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast(confirmStatus === "picked" ? "Marked as picked" : "Marked as delivered");
      setConfirmStatus(null);

      if (confirmStatus === "delivered") {
        router.back();
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to update status");
      setConfirmStatus(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-appbg" edges={["bottom"]}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 30 }}>
        {detailsQuery.isLoading ? (
          <View className="mt-3"><SkeletonList rows={5} /></View>
        ) : order ? (
          <View className="mt-3 space-y-3">
            <View className="rounded-xl border border-border bg-card p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-interSemi text-primary">{order.customer_name ?? "Customer"}</Text>
                <StatusChip status={order.status} />
              </View>
              <Text className="mt-2 text-sm text-neutral-600">{order.customer_address ?? "No address"}</Text>
              <Pressable className="mt-2 h-12 items-center justify-center rounded-lg border border-border" onPress={makeCall}>
                <Text className="text-sm font-interSemi text-primary">Call {order.customer_phone ?? "Customer"}</Text>
              </Pressable>
            </View>

            <Pressable className="rounded-xl border border-border bg-card p-4" onPress={openMaps}>
              <Text className="text-sm font-interSemi text-primary">Open in Maps</Text>
              <Text className="mt-1 text-xs text-neutral-500">Tap to open Apple/Google Maps with this address.</Text>
            </Pressable>

            <View className="rounded-xl border border-border bg-card p-3">
              <Text className="text-base font-interSemi text-primary">Items</Text>
              <View className="mt-2 space-y-2">
                {items.map((item) => (
                  <View key={item.id} className="rounded-lg border border-border p-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-interSemi text-primary">{item.name}</Text>
                      <Text className="text-sm text-neutral-600">{item.quantity} × {currency(item.price)}</Text>
                    </View>
                    {item.notes ? <Text className="mt-1 text-xs text-neutral-500">{item.notes}</Text> : null}
                  </View>
                ))}
              </View>
            </View>

            <View className="rounded-xl border border-border bg-card p-3">
              <Text className="text-base font-interSemi text-primary">Total {currency(Number(order.total_amount))}</Text>
              {order.notes ? <Text className="mt-1 text-sm text-neutral-600">{order.notes}</Text> : null}
            </View>

            <View className="flex-row gap-2">
              <Pressable
                className="h-12 flex-1 items-center justify-center rounded-xl bg-primary"
                onPress={() => setConfirmStatus("picked")}
                disabled={order.status === "picked" || order.status === "delivered"}
              >
                <Text className="text-sm font-interSemi text-white">Mark Picked Up</Text>
              </Pressable>
              <Pressable
                className={`h-12 flex-1 items-center justify-center rounded-xl ${canMarkDelivered ? "bg-primary" : "bg-neutral-300"}`}
                onPress={() => setConfirmStatus("delivered")}
                disabled={!canMarkDelivered}
              >
                <Text className="text-sm font-interSemi text-white">Mark Delivered</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="mt-3 rounded-xl border border-border bg-card p-4">
            <Text className="text-sm text-neutral-600">Order not found.</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={Boolean(confirmStatus)} transparent animationType="fade" onRequestClose={() => setConfirmStatus(null)}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-xl border border-border bg-card p-4">
            <Text className="text-base font-interSemi text-primary">Confirm status change</Text>
            <Text className="mt-2 text-sm text-neutral-600">
              {confirmStatus === "picked" ? "Mark this order as picked up?" : "Mark this order as delivered?"}
            </Text>

            <View className="mt-4 flex-row gap-2">
              <Pressable className="h-12 flex-1 items-center justify-center rounded-xl border border-border" onPress={() => setConfirmStatus(null)}>
                <Text className="text-sm font-inter text-primary">Cancel</Text>
              </Pressable>
              <Pressable className="h-12 flex-1 items-center justify-center rounded-xl bg-primary" onPress={updateStatus}>
                <Text className="text-sm font-interSemi text-white">Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
