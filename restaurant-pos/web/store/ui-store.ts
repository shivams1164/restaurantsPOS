// FILE: web/store/ui-store.ts
import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  selectedOrderIds: string[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleOrderSelection: (id: string) => void;
  clearSelectedOrders: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  selectedOrderIds: [],
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleOrderSelection: (id) =>
    set((state) => {
      const exists = state.selectedOrderIds.includes(id);
      return {
        selectedOrderIds: exists
          ? state.selectedOrderIds.filter((value) => value !== id)
          : [...state.selectedOrderIds, id]
      };
    }),
  clearSelectedOrders: () => set({ selectedOrderIds: [] })
}));
