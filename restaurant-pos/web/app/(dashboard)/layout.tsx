// FILE: web/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SessionProvider } from "@/components/providers/session-provider";
import { createClient } from "@/lib/supabase/server";
import { ensureOwnerRestaurant, getMyProfile, getOwnerRestaurant } from "@/lib/supabase/queries";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getMyProfile(supabase, user.id);
  if (profile.role !== "owner") {
    redirect("/login");
  }

  let restaurant = profile.restaurant_id ? await getOwnerRestaurant(supabase, profile.id) : null;
  if (!restaurant) {
    restaurant = await ensureOwnerRestaurant(supabase, profile);
  }

  return (
    <SessionProvider
      value={{
        profile: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          restaurant_id: restaurant.id,
          avatar_url: profile.avatar_url
        },
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          logo_url: restaurant.logo_url,
          operating_hours: restaurant.operating_hours
        }
      }}
    >
      <DashboardShell restaurantId={restaurant.id} restaurantName={restaurant.name} userName={profile.name}>
        {children}
      </DashboardShell>
    </SessionProvider>
  );
}
