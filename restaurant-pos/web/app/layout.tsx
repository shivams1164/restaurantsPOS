// FILE: web/app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Amber POS Dashboard",
  description: "Restaurant POS and management dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <QueryProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
