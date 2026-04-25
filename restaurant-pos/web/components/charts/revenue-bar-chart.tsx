// FILE: web/components/charts/revenue-bar-chart.tsx
"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSnapshot } from "@/lib/supabase/queries";
import { currency } from "@/lib/utils";

export function RevenueBarChart({ data }: { data: DashboardSnapshot["revenueByDay"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 7 Days Revenue</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={42} />
            <Tooltip formatter={(value: number) => currency(value)} />
            <Bar dataKey="revenue" fill="#C97B2F" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
