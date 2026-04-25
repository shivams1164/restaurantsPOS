// FILE: mobile/store/auth-store.ts
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Session, User } from "@supabase/supabase-js";
import type { Tables } from "@/types/database";

const secureStorage = {
  getItem: async (name: string) => {
    const value = await SecureStore.getItemAsync(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  }
};

interface AuthState {
  user: User | null;
  profile: Tables<"profiles"> | null;
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Tables<"profiles"> | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      setSession: (session) => set({ session, user: session?.user ?? null }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ user: null, profile: null, session: null, isLoading: false })
    }),
    {
      name: "amber-pos-auth",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ session: state.session, user: state.user, profile: state.profile })
    }
  )
);
