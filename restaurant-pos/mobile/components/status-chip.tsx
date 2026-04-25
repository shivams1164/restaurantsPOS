// FILE: mobile/components/status-chip.tsx
import { Text, View } from "react-native";
import type { OrderStatus } from "@/types/database";

const statusColors: Record<OrderStatus, { background: string; color: string }> = {
  pending: { background: "#FFF1D6", color: "#9A5700" },
  preparing: { background: "#DBEAFE", color: "#1E40AF" },
  ready: { background: "#DCFCE7", color: "#166534" },
  picked: { background: "#E5E7EB", color: "#374151" },
  delivered: { background: "#E5E7EB", color: "#4B5563" },
  cancelled: { background: "#FEE2E2", color: "#991B1B" }
};

export function StatusChip({ status }: { status: OrderStatus }) {
  const colors = statusColors[status];

  return (
    <View style={{ backgroundColor: colors.background }} className="rounded-full px-2.5 py-1">
      <Text style={{ color: colors.color }} className="text-xs font-interSemi capitalize">
        {status}
      </Text>
    </View>
  );
}
