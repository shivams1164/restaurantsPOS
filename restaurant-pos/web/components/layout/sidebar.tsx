// FILE: web/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Utensils, Users, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { webStrings } from "@/constants/strings";

const navItems = [
  { href: "/dashboard", label: webStrings.nav.dashboard, icon: LayoutDashboard },
  { href: "/orders", label: webStrings.nav.orders, icon: ClipboardList },
  { href: "/menu", label: webStrings.nav.menu, icon: Utensils },
  { href: "/staff", label: webStrings.nav.staff, icon: Users },
  { href: "/settings", label: webStrings.nav.settings, icon: Settings }
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-white/10 bg-sidebar text-sidebar-foreground transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-3">
        <span className={cn("text-sm font-semibold", sidebarCollapsed && "hidden")}>{webStrings.appName}</span>
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition",
                    active ? "bg-app-accent text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
