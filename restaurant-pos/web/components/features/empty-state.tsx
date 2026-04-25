// FILE: web/components/features/empty-state.tsx
import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-app-border bg-white p-10 text-center">
      <svg width="108" height="80" viewBox="0 0 108 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="12" y="12" width="84" height="56" rx="12" fill="#F4F2EB" stroke="#E5E3DF" />
        <path d="M26 41H82" stroke="#C97B2F" strokeWidth="4" strokeLinecap="round" />
        <circle cx="36" cy="30" r="4" fill="#C97B2F" />
        <circle cx="72" cy="52" r="4" fill="#D4AF7A" />
      </svg>
      <h3 className="mt-4 text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
