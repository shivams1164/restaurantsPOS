// FILE: mobile/app/(waiter)/tables.tsx
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonList } from "@/components/skeleton-list";
import { mobileStrings, tableStatusColors } from "@/constants/strings";
import { useOrdersRealtime } from "@/hooks/use-orders-realtime";
import { useTableStatus } from "@/hooks/use-waiter";
import { useAuthStore } from "@/store/auth-store";

const tableCount = 12;

export default function WaiterTablesScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);

  const tableStatusQuery = useTableStatus(profile?.restaurant_id ?? null, tableCount);

  useOrdersRealtime(profile?.restaurant_id ?? null);

  return (
    <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="mt-2 text-2xl font-interSemi text-primary">{mobileStrings.waiter.tablesTitle}</Text>
        <Text className="mb-4 mt-1 text-sm text-neutral-500">Tap a table to manage current orders.</Text>

        {tableStatusQuery.isLoading ? (
          <SkeletonList rows={6} />
        ) : (
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {(tableStatusQuery.data ?? []).map((table) => (
              <Pressable
                key={table.table}
                className="h-24 w-[31%] items-center justify-center rounded-xl border bg-card"
                style={{ borderColor: tableStatusColors[table.status], borderWidth: 2 }}
                onPress={() => {
                  if (table.status === "occupied") {
                    router.push({ pathname: "/(waiter)/orders", params: { table: String(table.table) } });
                    return;
                  }

                  router.push({ pathname: "/(waiter)/menu", params: { table: String(table.table) } });
                }}
              >
                <Text className="text-sm text-neutral-500">Table</Text>
                <Text className="text-xl font-interSemi text-primary">{table.table}</Text>
                <View
                  className="mt-2 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: tableStatusColors[table.status] }}
                />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
