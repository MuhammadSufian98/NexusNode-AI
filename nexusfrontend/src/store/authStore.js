"use client";

import { create } from "zustand";

export const useAuth = create((set) => ({
  user: null,
  authView: "login",
  direction: 0,
  switchView: (view) =>
    set({
      direction: view === "signup" ? 1 : -1,
      authView: view,
    }),
  login: (data) => set({ user: { name: "User", ...data } }),
  signup: (data) => set({ user: { name: data.name, ...data } }),
  logout: () => set({ user: null }),
}));