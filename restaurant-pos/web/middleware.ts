// FILE: web/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

const protectedPaths = ["/dashboard", "/orders", "/menu", "/staff", "/settings"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...(options as Parameters<typeof request.cookies.set>[0]) });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...(options as Parameters<typeof response.cookies.set>[0]) });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: "", ...(options as Parameters<typeof request.cookies.set>[0]) });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...(options as Parameters<typeof response.cookies.set>[0]) });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (pathname === "/login" && profile?.role === "owner") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }

    if (isProtected && profile?.role !== "owner") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/orders/:path*", "/menu/:path*", "/staff/:path*", "/settings/:path*", "/login"]
};
