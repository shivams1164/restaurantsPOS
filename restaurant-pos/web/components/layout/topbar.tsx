// FILE: web/components/layout/topbar.tsx
"use client";

import { Bell, ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { signOut } from "@/lib/supabase/queries";
import { useSupabaseClient } from "@/hooks/use-supabase-client";

interface TopbarProps {
  restaurantName: string;
  userName: string;
  pendingCount: number;
}

export function Topbar({ restaurantName, userName, pendingCount }: TopbarProps) {
  const client = useSupabaseClient();
  const router = useRouter();

  const onSignOut = async () => {
    try {
      await signOut(client);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign out failed");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-app-border bg-app-background/95 px-6 backdrop-blur-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Restaurant</p>
        <h1 className="text-base font-semibold text-neutral-900">{restaurantName}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button type="button" className="relative rounded-xl border border-app-border bg-white p-2 text-neutral-700 hover:bg-neutral-50">
          <Bell size={18} />
          {pendingCount > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-app-accent px-1 text-center text-[10px] font-semibold text-white">
              {pendingCount}
            </span>
          ) : null}
        </button>

        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-app-border bg-white px-2 py-1.5 text-sm text-neutral-800">
            <Avatar fallback={userName} />
            <span className="hidden md:block">{userName}</span>
            <ChevronDown size={14} />
          </summary>
          <div className="absolute right-0 mt-2 min-w-44 rounded-xl border border-app-border bg-white p-1 shadow-lg">
            <button
              type="button"
              onClick={onSignOut}
              className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
