// FILE: mobile/app/(auth)/login.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mobileStrings } from "@/constants/strings";
import { fetchProfile, signIn } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import { loginSchema, type LoginValues } from "@/schemas/auth";
import { useAuthStore } from "@/store/auth-store";

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setProfile = useAuthStore((state) => state.setProfile);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const auth = await signIn(supabase, values.email, values.password);
      if (!auth.user) {
        throw new Error("No user returned");
      }
      const profile = await fetchProfile(supabase, auth.user.id);
      return { auth, profile };
    },
    onSuccess: async ({ auth, profile }) => {
      setSession(auth.session);
      setProfile(profile);

      if (profile.role === "waiter") {
        router.replace("/(waiter)/tables");
        return;
      }

      if (profile.role === "delivery") {
        router.replace("/(delivery)/orders");
        return;
      }

      const ownerUrl = process.env.EXPO_PUBLIC_OWNER_DASHBOARD_URL;
      if (ownerUrl) {
        await Linking.openURL(ownerUrl);
      }
      await supabase.auth.signOut();
      showToast("Owner access is available on the web dashboard.");
      router.replace("/(auth)/login");
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : "Login failed");
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-appbg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 px-5">
        <View className="flex-1 justify-center">
          <View className="items-center">
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&h=160&fit=crop" }}
              className="h-20 w-20 rounded-2xl"
            />
            <Text className="mt-4 text-2xl font-interSemi text-primary">{mobileStrings.login.title}</Text>
            <Text className="mt-1 text-sm text-neutral-500">{mobileStrings.login.subtitle}</Text>
          </View>

          <View className="mt-8 space-y-3">
            <View>
              <Text className="mb-1 text-sm font-inter text-neutral-700">{mobileStrings.login.email}</Text>
              <Controller
                control={form.control}
                name="email"
                render={({ field: { onBlur, onChange, value } }) => (
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className="h-12 rounded-xl border border-border bg-card px-3 text-base text-primary"
                  />
                )}
              />
              {form.formState.errors.email ? (
                <Text className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-1 text-sm font-inter text-neutral-700">{mobileStrings.login.password}</Text>
              <Controller
                control={form.control}
                name="password"
                render={({ field: { onBlur, onChange, value } }) => (
                  <TextInput
                    secureTextEntry
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className="h-12 rounded-xl border border-border bg-card px-3 text-base text-primary"
                  />
                )}
              />
              {form.formState.errors.password ? (
                <Text className="mt-1 text-xs text-red-600">{form.formState.errors.password.message}</Text>
              ) : null}
            </View>

            <Pressable
              onPress={form.handleSubmit((values) => loginMutation.mutate(values))}
              className="mt-3 h-12 items-center justify-center rounded-xl bg-primary"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-interSemi text-white">{mobileStrings.login.submit}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
