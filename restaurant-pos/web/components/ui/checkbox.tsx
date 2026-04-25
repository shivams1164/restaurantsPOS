// FILE: web/components/ui/checkbox.tsx
"use client";

import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, className }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onCheckedChange(event.target.checked)}
      className={cn(
        "h-4 w-4 rounded border border-app-border text-app-accent focus:ring-app-accent",
        className
      )}
    />
  );
}
