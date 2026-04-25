// FILE: web/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_0%,#fff8e8_0%,#fafaf8_45%,#efeae0_100%)] p-4">
      {children}
    </div>
  );
}
