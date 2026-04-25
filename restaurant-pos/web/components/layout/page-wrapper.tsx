// FILE: web/components/layout/page-wrapper.tsx
import type { ReactNode } from "react";

export function PageWrapper({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
