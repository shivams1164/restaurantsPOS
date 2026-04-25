// FILE: web/components/features/order-details-panel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/features/status-badge";
import { useOrderDetails } from "@/hooks/use-orders";
import { currency, formatDateTime } from "@/lib/utils";

interface OrderDetailsPanelProps {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailsPanel({ orderId, onClose }: OrderDetailsPanelProps) {
  const { data, isLoading } = useOrderDetails(orderId);

  if (!orderId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-lg overflow-y-auto border-l border-app-border bg-white p-5 shadow-xl animate-slide-up">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Order Details</h3>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-neutral-500">Loading order details...</p>
        ) : data ? (
          <div className="space-y-4">
            <section className="rounded-xl border border-app-border p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Order ID</p>
              <p className="font-mono text-sm text-neutral-900">{data.order.id}</p>
              <div className="mt-3 flex items-center gap-3">
                <StatusBadge status={data.order.status} />
                <span className="text-xs text-neutral-500">{formatDateTime(data.order.created_at)}</span>
              </div>
            </section>

            <section className="rounded-xl border border-app-border p-4">
              <h4 className="text-sm font-semibold text-neutral-900">Items</h4>
              <div className="mt-3 space-y-2">
                {data.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-app-border/70 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-neutral-900">{item.name}</p>
                      <p className="font-mono text-sm text-neutral-700">
                        {item.quantity} × {currency(item.price)}
                      </p>
                    </div>
                    {item.notes ? <p className="mt-1 text-xs text-neutral-500">{item.notes}</p> : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-app-border p-4">
              <p className="text-sm text-neutral-600">Customer: {data.order.customer_name ?? "Walk-in"}</p>
              <p className="text-sm text-neutral-600">Address: {data.order.customer_address ?? "N/A"}</p>
              <p className="text-sm text-neutral-600">Phone: {data.order.customer_phone ?? "N/A"}</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">Total: {currency(Number(data.order.total_amount))}</p>
              {data.order.notes ? <p className="mt-2 text-sm text-neutral-500">Notes: {data.order.notes}</p> : null}
            </section>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Order details unavailable.</p>
        )}
      </aside>
    </div>
  );
}
