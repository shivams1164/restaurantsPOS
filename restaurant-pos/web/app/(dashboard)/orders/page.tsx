// FILE: web/app/(dashboard)/orders/page.tsx
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderDetailsPanel } from "@/components/features/order-details-panel";
import { SkeletonTable } from "@/components/features/skeleton-table";
import { StatusBadge } from "@/components/features/status-badge";
import { EmptyState } from "@/components/features/empty-state";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { useSessionContext } from "@/components/providers/session-provider";
import { useDeliveryStaff, useOrderMutations, useOrders } from "@/hooks/use-orders";
import { useRealtimeOrders } from "@/hooks/use-realtime-orders";
import { useUiStore } from "@/store/ui-store";
import type { OrderStatus } from "@/types/database";
import { compactId, currency, formatDateTime } from "@/lib/utils";

const statusTabs: Array<{ label: string; value: "all" | OrderStatus }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Delivered", value: "delivered" }
];

const statusOptions: OrderStatus[] = ["pending", "preparing", "ready", "picked", "delivered", "cancelled"];

export default function OrdersPage() {
  const { restaurant } = useSessionContext();
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("preparing");

  const { selectedOrderIds, toggleOrderSelection, clearSelectedOrders } = useUiStore();

  const ordersQuery = useOrders({
    restaurantId: restaurant.id,
    status,
    search,
    date: date || undefined
  });

  const deliveryStaffQuery = useDeliveryStaff(restaurant.id);
  const { statusMutation, assignDeliveryMutation, bulkStatusMutation } = useOrderMutations(restaurant.id);

  useRealtimeOrders(restaurant.id, (orderId) => {
    setHighlightedOrderId(orderId);
    window.setTimeout(() => setHighlightedOrderId((current) => (current === orderId ? null : current)), 900);
  });

  const rows = ordersQuery.data ?? [];

  const selectedSet = useMemo(() => new Set(selectedOrderIds), [selectedOrderIds]);
  const allVisibleSelected = rows.length > 0 && rows.every((row) => selectedSet.has(row.id));

  const onToggleAll = (checked: boolean) => {
    if (!checked) {
      clearSelectedOrders();
      return;
    }

    rows.forEach((row) => {
      if (!selectedSet.has(row.id)) {
        toggleOrderSelection(row.id);
      }
    });
  };

  return (
    <PageWrapper title="Orders">
      <div className="rounded-xl border border-app-border bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={status === tab.value ? "default" : "secondary"}
                onClick={() => setStatus(tab.value)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search table/customer" />
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
        </div>
      </div>

      {selectedOrderIds.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-app-border bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">{selectedOrderIds.length} selected</p>
          <Select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value as OrderStatus)} className="max-w-40">
            {statusOptions.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Select>
          <Button
            size="sm"
            onClick={() => {
              bulkStatusMutation.mutate(
                { orderIds: selectedOrderIds, status: bulkStatus },
                {
                  onSuccess: () => {
                    toast.success("Orders updated");
                    clearSelectedOrders();
                  },
                  onError: (error) => toast.error(error instanceof Error ? error.message : "Update failed")
                }
              );
            }}
            disabled={bulkStatusMutation.isPending}
          >
            {bulkStatusMutation.isPending ? "Updating..." : "Apply"}
          </Button>
          <Button variant="ghost" size="sm" onClick={clearSelectedOrders}>Clear</Button>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-app-border bg-white">
        {ordersQuery.isLoading ? (
          <SkeletonTable />
        ) : rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allVisibleSelected} onCheckedChange={onToggleAll} />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Table/Type</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waiter</TableHead>
                <TableHead>Delivery Boy</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSet.has(row.id)}
                      onCheckedChange={() => toggleOrderSelection(row.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono">#{compactId(row.id)}</TableCell>
                  <TableCell>
                    {row.orderType === "dine_in" ? `Table ${row.tableNumber ?? "-"}` : row.orderType.replace("_", " ")}
                  </TableCell>
                  <TableCell>{row.itemSummary}</TableCell>
                  <TableCell className="font-mono">{currency(row.totalAmount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} animate={highlightedOrderId === row.id} />
                  </TableCell>
                  <TableCell>{row.waiterName}</TableCell>
                  <TableCell>
                    <Select
                      value={row.deliveryName ? deliveryStaffQuery.data?.find((item) => item.name === row.deliveryName)?.id ?? "" : ""}
                      onChange={(event) => {
                        const deliveryId = event.target.value || null;
                        assignDeliveryMutation.mutate(
                          { orderId: row.id, deliveryId },
                          {
                            onError: (error) => toast.error(error instanceof Error ? error.message : "Assignment failed")
                          }
                        );
                      }}
                    >
                      <option value="">Unassigned</option>
                      {(deliveryStaffQuery.data ?? []).map((staff) => (
                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedOrderId(row.id)}>
                        View
                      </Button>
                      <Select
                        value={row.status}
                        onChange={(event) => {
                          statusMutation.mutate(
                            { orderId: row.id, status: event.target.value as OrderStatus },
                            {
                              onSuccess: () => toast.success("Status updated"),
                              onError: (error) => toast.error(error instanceof Error ? error.message : "Status update failed")
                            }
                          );
                        }}
                      >
                        {statusOptions.map((statusValue) => (
                          <option key={statusValue} value={statusValue}>{statusValue}</option>
                        ))}
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-4">
            <EmptyState
              title="No orders found"
              description="Try changing filters or wait for new incoming orders in realtime."
            />
          </div>
        )}
      </div>

      <OrderDetailsPanel orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
    </PageWrapper>
  );
}
