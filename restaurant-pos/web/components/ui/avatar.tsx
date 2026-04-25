// FILE: web/components/ui/avatar.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  fallback: string;
  className?: string;
}

export function Avatar({ src, fallback, className }: AvatarProps) {
  if (src) {
    return (
      <div className={cn("relative h-9 w-9 overflow-hidden rounded-full border border-app-border", className)}>
        <Image src={src} alt={fallback} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-app-border bg-neutral-100 text-xs font-semibold text-neutral-700",
        className
      )}
    >
      {fallback
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );
}
