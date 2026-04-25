// FILE: web/components/features/skeleton-table.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTable({ rows = 6, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 rounded-xl border border-app-border bg-white p-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((__, colIndex) => (
            <Skeleton key={`${rowIndex}-${colIndex}`} className="h-8" />
          ))}
        </div>
      ))}
    </div>
  );
}
