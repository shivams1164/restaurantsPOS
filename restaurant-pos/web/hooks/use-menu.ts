// FILE: web/hooks/use-menu.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listMenuCategories,
  listMenuItems,
  removeMenuItem,
  setMenuAvailability,
  upsertMenuItem,
  uploadPublicImage
} from "@/lib/supabase/queries";
import { useSupabaseClient } from "@/hooks/use-supabase-client";
import type { Tables } from "@/types/database";

interface UseMenuItemsInput {
  restaurantId: string;
  category: string;
}

export function useMenuItems(input: UseMenuItemsInput) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ["menu-items", input.restaurantId, input.category],
    queryFn: () => listMenuItems(client, input.restaurantId, input.category),
    enabled: Boolean(input.restaurantId)
  });
}

export function useMenuCategories(restaurantId: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ["menu-categories", restaurantId],
    queryFn: () => listMenuCategories(client, restaurantId),
    enabled: Boolean(restaurantId)
  });
}

export function useMenuMutations(restaurantId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["menu-items", restaurantId] });
    await queryClient.invalidateQueries({ queryKey: ["menu-categories", restaurantId] });
  };

  const saveMutation = useMutation({
    mutationFn: (values: {
      id?: string;
      name: string;
      description?: string;
      price: number;
      category: string;
      prep_time_min: number;
      available: boolean;
      image_url?: string;
    }) => upsertMenuItem(client, restaurantId, values),
    onSuccess: invalidate
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => removeMenuItem(client, itemId),
    onSuccess: invalidate
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ itemId, available }: { itemId: string; available: boolean }) =>
      setMenuAvailability(client, itemId, available),
    onMutate: async ({ itemId, available }) => {
      await queryClient.cancelQueries({ queryKey: ["menu-items", restaurantId] });
      const previous = queryClient.getQueriesData({ queryKey: ["menu-items", restaurantId] });

      queryClient.setQueriesData({ queryKey: ["menu-items", restaurantId] }, (old: Tables<"menu_items">[] | undefined) => {
        if (!old) return old;
        return old.map((item) => (item.id === itemId ? { ...item, available } : item));
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: invalidate
  });

  const uploadMutation = useMutation({
    mutationFn: ({ path, file }: { path: string; file: File }) => uploadPublicImage(client, path, file)
  });

  return {
    saveMutation,
    deleteMutation,
    availabilityMutation,
    uploadMutation
  };
}
