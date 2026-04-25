// FILE: web/components/ui/modal.tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true">
      <div className={cn("w-full max-w-[480px] rounded-xl border border-app-border bg-white p-5 shadow-xl animate-slide-up", className)}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-800">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
