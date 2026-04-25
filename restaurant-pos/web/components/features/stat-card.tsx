// FILE: web/components/features/stat-card.tsx
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-xs uppercase tracking-wide text-neutral-500">{title}</CardTitle>
        <Icon size={16} className="text-neutral-500" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-neutral-900">{value}</p>
      </CardContent>
    </Card>
  );
}
