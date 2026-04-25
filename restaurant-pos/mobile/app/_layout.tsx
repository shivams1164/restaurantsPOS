// FILE: mobile/app/_layout.tsx
import "@/global.css";

import { Inter_400Regular, Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fetchProfile } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold });
  const queryClient = useMemo(() => new QueryClient(), []);
  const router = useRouter();
  const segments = useSegments();

  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setSession = useAuthStore((state) => state.setSession);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const {
          data: { session: initialSession }
        } = await supabase.auth.getSession();

        if (!active) {
          return;
        }

        setSession(initialSession);

        if (initialSession?.user) {
          const loadedProfile = await fetchProfile(supabase, initialSession.user.id);
          if (!active) {
            return;
          }
          setProfile(loadedProfile);
        } else {
          setProfile(null);
        }
      } catch {
        if (active) {
          clear();
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

      if (nextSession?.user) {
        try {
          const loadedProfile = await fetchProfile(supabase, nextSession.user.id);
          setProfile(loadedProfile);
        } catch {
          clear();
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [clear, setLoading, setProfile, setSession]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const root = segments[0];

    if (!session) {
      if (root !== "(auth)") {
        router.replace("/(auth)/login");
      }
      return;
    }

    if (!profile) {
      return;
    }

    if (profile.role === "waiter" && root !== "(waiter)") {
      router.replace("/(waiter)/tables");
      return;
    }

    if (profile.role === "delivery" && root !== "(delivery)") {
      router.replace("/(delivery)/orders");
      return;
    }

    if (profile.role === "owner") {
      const ownerUrl = process.env.EXPO_PUBLIC_OWNER_DASHBOARD_URL;
      if (ownerUrl) {
        void Linking.openURL(ownerUrl);
      }
      void supabase.auth.signOut();
      router.replace("/(auth)/login");
    }
  }, [isLoading, profile, router, segments, session]);

  if (!fontsLoaded || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-appbg">
        <ActivityIndicator size="large" color="#1A1A1A" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
