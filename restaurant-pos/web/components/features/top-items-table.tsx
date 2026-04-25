// FILE: web/components/features/top-items-table.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSnapshot } from "@/lib/supabase/queries";
import { currency } from "@/lib/utils";

export function TopItemsTable({ items }: { items: DashboardSnapshot["topItems"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Items Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-app-border text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-2 py-2">Rank</th>
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Qty</th>
                <th className="px-2 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.rank} className="border-b border-app-border/60">
                  <td className="px-2 py-2 font-mono">#{item.rank}</td>
                  <td className="px-2 py-2 font-medium">{item.name}</td>
                  <td className="px-2 py-2">{item.qty}</td>
                  <td className="px-2 py-2 font-mono">{currency(item.revenue)}</td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-neutral-500">No sales data available today.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
