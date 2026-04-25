// FILE: mobile/app/(waiter)/menu.tsx
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { QuantityStepper } from "@/components/quantity-stepper";
import { SkeletonList } from "@/components/skeleton-list";
import { mobileStrings } from "@/constants/strings";
import { useWaiterMenu, useWaiterMenuCategories, usePlaceWaiterOrder } from "@/hooks/use-waiter";
import { currency } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth-store";

type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
};

export default function WaiterMenuScreen() {
  const params = useLocalSearchParams<{ table?: string }>();
  const tableNumber = Number(params.table ?? 1);

  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [orderNotes, setOrderNotes] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const menuQuery = useWaiterMenu(profile?.restaurant_id ?? null, search, category);
  const categoryQuery = useWaiterMenuCategories(profile?.restaurant_id ?? null);
  const placeOrderMutation = usePlaceWaiterOrder(profile?.id ?? null, profile?.restaurant_id ?? null);

  const categories = useMemo(() => ["all", ...(categoryQuery.data ?? [])], [categoryQuery.data]);

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0), [cartItems]);

  const updateQuantity = (menuItemId: string, name: string, price: number, quantity: number) => {
    setCart((current) => {
      if (quantity <= 0) {
        const next = { ...current };
        delete next[menuItemId];
        return next;
      }

      const existing = current[menuItemId];
      return {
        ...current,
        [menuItemId]: {
          menuItemId,
          name,
          price,
          quantity,
          notes: existing?.notes ?? ""
        }
      };
    });
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      return;
    }

    try {
      await placeOrderMutation.mutateAsync({
        tableNumber,
        notes: orderNotes || undefined,
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || undefined
        }))
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Order placed successfully");
      setCart({});
      setOrderNotes("");
      setCartOpen(false);
      router.replace("/(waiter)/tables");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not place order");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
      <View className="px-4 pb-28">
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-2xl font-interSemi text-primary">{mobileStrings.waiter.menuTitle}</Text>
          <View className="rounded-full bg-accent px-3 py-1">
            <Text className="text-xs font-interSemi text-primary">Table {tableNumber}</Text>
          </View>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search menu"
          className="mt-3 h-12 rounded-xl border border-border bg-card px-3"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 max-h-12">
          <View className="flex-row gap-2">
            {categories.map((item) => (
              <Pressable
                key={item}
                className={`h-10 rounded-full px-4 items-center justify-center ${category === item ? "bg-primary" : "bg-card border border-border"}`}
                onPress={() => setCategory(item)}
              >
                <Text className={`${category === item ? "text-white" : "text-primary"} text-sm font-interSemi`}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {menuQuery.isLoading ? (
          <View className="mt-4">
            <SkeletonList rows={6} />
          </View>
        ) : (
          <FlatList
            data={menuQuery.data ?? []}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20, gap: 10 }}
            columnWrapperStyle={{ gap: 10 }}
            renderItem={({ item }) => {
              const quantity = cart[item.id]?.quantity ?? 0;
              return (
                <View className="w-[48%] rounded-xl border border-border bg-card p-2">
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} className="h-24 w-full rounded-lg" />
                  ) : (
                    <View className="h-24 items-center justify-center rounded-lg bg-neutral-100">
                      <Text className="text-xs text-neutral-400">No image</Text>
                    </View>
                  )}
                  <Text numberOfLines={1} className="mt-2 text-sm font-interSemi text-primary">{item.name}</Text>
                  <Text className="mt-1 text-sm text-neutral-600">{currency(Number(item.price))}</Text>
                  <View className="mt-2">
                    <QuantityStepper
                      value={quantity}
                      onChange={(next) => updateQuantity(item.id, item.name, Number(item.price), next)}
                    />
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {cartCount > 0 ? (
        <View className="absolute bottom-20 left-4 right-4 rounded-xl border border-border bg-primary p-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-inter text-white">{cartCount} item(s)</Text>
            <Text className="text-base font-interSemi text-white">{currency(cartTotal)}</Text>
          </View>
          <Pressable className="mt-2 h-12 items-center justify-center rounded-lg bg-accent" onPress={() => setCartOpen(true)}>
            <Text className="text-sm font-interSemi text-primary">{mobileStrings.waiter.viewCart}</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal visible={cartOpen} transparent animationType="slide" onRequestClose={() => setCartOpen(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[85%] rounded-t-3xl bg-appbg p-4">
            <Text className="text-lg font-interSemi text-primary">Cart</Text>
            <ScrollView className="mt-3">
              {cartItems.map((item) => (
                <View key={item.menuItemId} className="mb-3 rounded-xl border border-border bg-card p-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-interSemi text-primary">{item.name}</Text>
                    <Text className="text-sm font-inter text-neutral-600">{currency(item.price)}</Text>
                  </View>
                  <View className="mt-2">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(next) => updateQuantity(item.menuItemId, item.name, item.price, next)}
                      min={0}
                    />
                  </View>
                  <TextInput
                    value={item.notes}
                    onChangeText={(text) =>
                      setCart((current) => ({
                        ...current,
                        [item.menuItemId]: {
                          ...current[item.menuItemId],
                          notes: text
                        }
                      }))
                    }
                    placeholder="Item notes"
                    className="mt-2 h-11 rounded-lg border border-border bg-appbg px-3"
                  />
                </View>
              ))}

              <TextInput
                value={orderNotes}
                onChangeText={setOrderNotes}
                placeholder="Order notes"
                multiline
                className="h-24 rounded-xl border border-border bg-card px-3 py-2"
              />
            </ScrollView>

            <View className="mt-3 flex-row gap-2">
              <Pressable className="h-12 flex-1 items-center justify-center rounded-xl border border-border bg-card" onPress={() => setCartOpen(false)}>
                <Text className="text-sm font-inter text-primary">Close</Text>
              </Pressable>
              <Pressable
                className="h-12 flex-1 items-center justify-center rounded-xl bg-primary"
                onPress={placeOrder}
                disabled={placeOrderMutation.isPending}
              >
                <Text className="text-sm font-interSemi text-white">
                  {placeOrderMutation.isPending ? "Placing..." : mobileStrings.waiter.placeOrder}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
