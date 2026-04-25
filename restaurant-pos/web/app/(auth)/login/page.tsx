// FILE: web/app/(auth)/login/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { webStrings } from "@/constants/strings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseClient } from "@/hooks/use-supabase-client";
import { getMyProfile, signInWithEmailPassword } from "@/lib/supabase/queries";
import { loginSchema, type LoginValues } from "@/schemas/auth";

export default function LoginPage() {
  const client = useSupabaseClient();
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const signInMutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const authData = await signInWithEmailPassword(client, values.email, values.password);
      const user = authData.user;
      if (!user) {
        throw new Error("Unable to load user after sign-in.");
      }
      const profile = await getMyProfile(client, user.id);
      return profile;
    },
    onSuccess: (profile) => {
      if (profile.role === "owner") {
        router.replace("/dashboard");
        router.refresh();
      } else {
        toast.info("Use the mobile app for waiter and delivery accounts.");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  });

  const onSubmit = (values: LoginValues) => {
    signInMutation.mutate(values);
  };

  return (
    <Card className="w-full max-w-md border-app-border bg-white">
      <CardHeader>
        <CardTitle className="text-2xl">{webStrings.auth.title}</CardTitle>
        <p className="text-sm text-neutral-500">{webStrings.auth.subtitle}</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">{webStrings.auth.emailLabel}</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{webStrings.auth.passwordLabel}</Label>
            <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={signInMutation.isPending}>
            {signInMutation.isPending ? "Signing in..." : webStrings.auth.submit}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-neutral-500">{webStrings.auth.ownerOnly}</p>
      </CardContent>
    </Card>
  );
}
