// FILE: web/hooks/use-settings.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRestaurantSettings, updateRestaurantSettings, uploadPublicImage } from "@/lib/supabase/queries";
import { useSupabaseClient } from "@/hooks/use-supabase-client";

export function useRestaurantSettings(restaurantId: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ["restaurant-settings", restaurantId],
    queryFn: () => getRestaurantSettings(client, restaurantId),
    enabled: Boolean(restaurantId)
  });
}

export function useRestaurantSettingsMutations(restaurantId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (values: {
      name: string;
      address?: string;
      phone?: string;
      logo_url?: string;
      operating_hours: Record<string, { enabled: boolean; open: string; close: string }>;
    }) => updateRestaurantSettings(client, restaurantId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["restaurant-settings", restaurantId] });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: ({ path, file }: { path: string; file: File }) => uploadPublicImage(client, path, file)
  });

  return {
    saveMutation,
    uploadMutation
  };
}
