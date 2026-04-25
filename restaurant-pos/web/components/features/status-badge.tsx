// FILE: web/components/features/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/database";
import { webStrings } from "@/constants/strings";

export function StatusBadge({ status, animate = false }: { status: OrderStatus; animate?: boolean }) {
  const variant =
    status === "pending"
      ? "amber"
      : status === "preparing"
        ? "blue"
        : status === "ready"
          ? "green"
          : status === "delivered"
            ? "gray"
            : status === "cancelled"
              ? "red"
              : "neutral";

  return <Badge className={animate ? "status-badge-change" : undefined} variant={variant}>{webStrings.statuses[status]}</Badge>;
}
