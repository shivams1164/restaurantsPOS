// FILE: web/components/charts/status-donut-chart.tsx
"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSnapshot } from "@/lib/supabase/queries";

const colorByStatus: Record<string, string> = {
  pending: "#C97B2F",
  preparing: "#2F80ED",
  ready: "#2E7D32",
  delivered: "#6B7280",
  cancelled: "#DC2626",
  picked: "#4B5563"
};

export function StatusDonutChart({ data }: { data: DashboardSnapshot["statusBreakdown"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status Split</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={60} outerRadius={90} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={colorByStatus[entry.status] ?? "#9CA3AF"} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
