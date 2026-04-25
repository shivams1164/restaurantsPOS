// FILE: web/app/(dashboard)/orders/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function OrdersRouteError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-app-border bg-white p-6 text-center">
      <h2 className="text-lg font-semibold">Orders error</h2>
      <p className="mt-2 text-sm text-neutral-500">{error.message}</p>
      <Button className="mt-4" onClick={reset}>Retry</Button>
    </div>
  );
}
