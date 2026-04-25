// FILE: web/components/ui/textarea.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-[96px] w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
