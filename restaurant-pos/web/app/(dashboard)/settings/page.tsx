// FILE: web/app/(dashboard)/settings/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { daysOfWeek } from "@/constants/strings";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useSessionContext } from "@/components/providers/session-provider";
import { useRestaurantSettings, useRestaurantSettingsMutations } from "@/hooks/use-settings";
import { restaurantSettingsSchema, type RestaurantSettingsValues } from "@/schemas/settings";

function defaultHours() {
  return {
    monday: { enabled: true, open: "09:00", close: "21:00" },
    tuesday: { enabled: true, open: "09:00", close: "21:00" },
    wednesday: { enabled: true, open: "09:00", close: "21:00" },
    thursday: { enabled: true, open: "09:00", close: "21:00" },
    friday: { enabled: true, open: "09:00", close: "22:00" },
    saturday: { enabled: true, open: "10:00", close: "22:00" },
    sunday: { enabled: true, open: "10:00", close: "20:00" }
  };
}

export default function SettingsPage() {
  const { restaurant } = useSessionContext();
  const settingsQuery = useRestaurantSettings(restaurant.id);
  const { saveMutation, uploadMutation } = useRestaurantSettingsMutations(restaurant.id);

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<RestaurantSettingsValues>({
    resolver: zodResolver(restaurantSettingsSchema),
    defaultValues: {
      name: restaurant.name,
      address: restaurant.address ?? "",
      phone: restaurant.phone ?? "",
      logo_url: restaurant.logo_url ?? "",
      operating_hours: defaultHours()
    }
  });

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    const incomingHours = settingsQuery.data.operating_hours;
    const normalizedHours = defaultHours();

    if (incomingHours && typeof incomingHours === "object" && !Array.isArray(incomingHours)) {
      for (const day of daysOfWeek) {
        const value = (incomingHours as Record<string, { enabled?: boolean; open?: string; close?: string }>)[day];
        if (value) {
          normalizedHours[day] = {
            enabled: value.enabled ?? normalizedHours[day].enabled,
            open: value.open ?? normalizedHours[day].open,
            close: value.close ?? normalizedHours[day].close
          };
        }
      }
    }

    form.reset({
      name: settingsQuery.data.name,
      address: settingsQuery.data.address ?? "",
      phone: settingsQuery.data.phone ?? "",
      logo_url: settingsQuery.data.logo_url ?? "",
      operating_hours: normalizedHours
    });
  }, [form, settingsQuery.data]);

  const submit = async (values: RestaurantSettingsValues) => {
    try {
      let logoUrl = values.logo_url || undefined;

      if (logoFile) {
        const extension = logoFile.name.split(".").pop() ?? "jpg";
        const path = `${restaurant.id}/branding/logo.${extension}`;
        logoUrl = await uploadMutation.mutateAsync({ path, file: logoFile });
      }

      await saveMutation.mutateAsync({
        name: values.name,
        address: values.address || undefined,
        phone: values.phone || undefined,
        logo_url: logoUrl,
        operating_hours: values.operating_hours
      });

      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings");
    }
  };

  const orderedDays = useMemo(() => [...daysOfWeek], []);

  if (settingsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <PageWrapper title="Settings">
      <form className="space-y-5" onSubmit={form.handleSubmit(submit)}>
        <section className="rounded-xl border border-app-border bg-white p-4">
          <h3 className="text-base font-semibold text-neutral-900">Restaurant Profile</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <Label>Name</Label>
              <Input {...form.register("name")} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input {...form.register("phone")} />
            </div>
            <div className="space-y-1">
              <Label>Logo</Label>
              <Input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Address</Label>
              <Input {...form.register("address")} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-app-border bg-white p-4">
          <h3 className="text-base font-semibold text-neutral-900">Operating Hours</h3>
          <div className="mt-4 space-y-3">
            {orderedDays.map((day) => {
              const enabled = form.watch(`operating_hours.${day}.enabled`);
              return (
                <div key={day} className="grid items-center gap-3 rounded-lg border border-app-border/70 p-3 md:grid-cols-[160px_80px_1fr_1fr]">
                  <p className="text-sm font-medium capitalize text-neutral-800">{day}</p>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(value) => form.setValue(`operating_hours.${day}.enabled`, value, { shouldValidate: true })}
                  />
                  <Input
                    type="time"
                    disabled={!enabled}
                    {...form.register(`operating_hours.${day}.open`)}
                  />
                  <Input
                    type="time"
                    disabled={!enabled}
                    {...form.register(`operating_hours.${day}.close`)}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending || uploadMutation.isPending}>
            {saveMutation.isPending || uploadMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}
