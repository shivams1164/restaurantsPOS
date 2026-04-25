// FILE: web/components/ui/select.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-app-border bg-white px-3 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
