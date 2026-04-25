// FILE: web/components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", {
  variants: {
    variant: {
      neutral: "bg-neutral-100 text-neutral-700",
      amber: "bg-amber-100 text-amber-800",
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      gray: "bg-gray-100 text-gray-700",
      red: "bg-red-100 text-red-700"
    }
  },
  defaultVariants: {
    variant: "neutral"
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
