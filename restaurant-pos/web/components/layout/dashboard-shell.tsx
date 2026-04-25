// FILE: web/components/layout/dashboard-shell.tsx
"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useDashboard } from "@/hooks/use-dashboard";

interface DashboardShellProps {
  children: ReactNode;
  restaurantId: string;
  restaurantName: string;
  userName: string;
}

export function DashboardShell({ children, restaurantId, restaurantName, userName }: DashboardShellProps) {
  const { data } = useDashboard(restaurantId);
  const pendingCount = data?.stats.pendingOrders ?? 0;

  return (
    <div className="flex min-h-screen bg-app-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar restaurantName={restaurantName} userName={userName} pendingCount={pendingCount} />
        <main className="h-[calc(100vh-4rem)] overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
