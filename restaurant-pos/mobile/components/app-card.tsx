// FILE: mobile/components/app-card.tsx
import { View } from "react-native";
import { cn } from "@/lib/utils";

export function AppCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <View className={cn("rounded-xl border border-border bg-card p-3", className)}>{children}</View>;
}
