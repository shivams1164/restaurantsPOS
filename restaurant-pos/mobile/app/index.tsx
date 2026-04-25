// FILE: mobile/app/index.tsx
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

export default function IndexScreen() {
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (profile?.role === "waiter") {
    return <Redirect href="/(waiter)/tables" />;
  }

  if (profile?.role === "delivery") {
    return <Redirect href="/(delivery)/orders" />;
  }

  return <Redirect href="/(auth)/login" />;
}
