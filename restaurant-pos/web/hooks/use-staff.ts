// FILE: web/hooks/use-staff.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStaffUser, listStaff, sendPasswordReset, setStaffActive } from "@/lib/supabase/queries";
import { useSupabaseClient } from "@/hooks/use-supabase-client";

export function useStaff(restaurantId: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ["staff", restaurantId],
    queryFn: () => listStaff(client, restaurantId),
    enabled: Boolean(restaurantId)
  });
}

export function useStaffMutations(restaurantId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["staff", restaurantId] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-snapshot", restaurantId] });
  };

  const createMutation = useMutation({
    mutationFn: (values: {
      name: string;
      email: string;
      password: string;
      role: "waiter" | "delivery";
      phone?: string;
    }) => createStaffUser(client, { ...values, restaurantId }),
    onSuccess: invalidate
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      setStaffActive(client, userId, isActive),
    onSuccess: invalidate
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => sendPasswordReset(client, email)
  });

  return {
    createMutation,
    toggleActiveMutation,
    resetPasswordMutation
  };
}
