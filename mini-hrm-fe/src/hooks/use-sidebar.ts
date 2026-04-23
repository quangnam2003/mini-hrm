import { create } from "zustand";

type SidebarState = {
  isPinned: boolean;
  setIsPinned: (v: boolean) => void;
};

export const useSidebarControl = create<SidebarState>((set) => ({
  isPinned: true,
  setIsPinned: (v) =>
    set({
      isPinned: v,
    }),
}));
