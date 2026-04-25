// FILE: web/components/features/orders-feed.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/features/status-badge";
import { compactId, currency, formatDateTime } from "@/lib/utils";
import type { DashboardSnapshot } from "@/lib/supabase/queries";

export function OrdersFeed({ orders }: { orders: DashboardSnapshot["recentOrders"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Orders Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="flex items-center justify-between rounded-lg border border-app-border bg-white p-3">
            <div>
              <p className="font-mono text-xs text-neutral-500">#{compactId(order.id)}</p>
              <p className="text-sm font-medium text-neutral-900">{order.tableLabel}</p>
              <p className="text-xs text-neutral-500">{order.customerName ?? "Walk-in"} • {formatDateTime(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={order.status} />
              <p className="mt-1 font-mono text-sm font-semibold text-neutral-900">{currency(order.total)}</p>
            </div>
          </article>
        ))}

        {orders.length === 0 ? <p className="text-sm text-neutral-500">No orders in the feed yet.</p> : null}
      </CardContent>
    </Card>
  );
}
