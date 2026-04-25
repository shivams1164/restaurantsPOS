// FILE: web/app/(dashboard)/dashboard/page.tsx
"use client";

import { ClipboardList, Clock3, DollarSign, Users } from "lucide-react";
import { OrdersFeed } from "@/components/features/orders-feed";
import { StatCard } from "@/components/features/stat-card";
import { TopItemsTable } from "@/components/features/top-items-table";
import { RevenueBarChart } from "@/components/charts/revenue-bar-chart";
import { StatusDonutChart } from "@/components/charts/status-donut-chart";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";
import { useRealtimeOrders } from "@/hooks/use-realtime-orders";
import { useSessionContext } from "@/components/providers/session-provider";
import { currency } from "@/lib/utils";
import { webStrings } from "@/constants/strings";

export default function DashboardPage() {
  const { restaurant } = useSessionContext();
  const { data, isLoading } = useDashboard(restaurant.id);

  useRealtimeOrders(restaurant.id);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  return (
    <PageWrapper title={webStrings.nav.dashboard}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title={webStrings.dashboard.todayRevenue} value={currency(data.stats.todaysRevenue)} icon={DollarSign} />
        <StatCard title={webStrings.dashboard.totalOrders} value={String(data.stats.totalOrders)} icon={ClipboardList} />
        <StatCard title={webStrings.dashboard.pendingOrders} value={String(data.stats.pendingOrders)} icon={Clock3} />
        <StatCard title={webStrings.dashboard.activeStaff} value={String(data.stats.activeStaff)} icon={Users} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <OrdersFeed orders={data.recentOrders} />
        </div>
        <div className="lg:col-span-3">
          <RevenueBarChart data={data.revenueByDay} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <StatusDonutChart data={data.statusBreakdown} />
        </div>
        <div className="lg:col-span-3">
          <TopItemsTable items={data.topItems} />
        </div>
      </div>
    </PageWrapper>
  );
}
