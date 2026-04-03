"use client";

import { create } from "zustand";
import {
  getCurrentUser,
  updateUserProfile,
  uploadUserAvatar,
} from "@/utils/authApi";
import { useAuth } from "@/store/authStore";

const toProfileUser = (apiUser) => ({
  name: apiUser?.full_name || "",
  email: apiUser?.email || "",
  avatar: apiUser?.avatar || "",
  clearance: apiUser?.clearance || "Lvl 4",
  nodesCount: Number(apiUser?.nodesCount || 0),
  isVerified: Boolean(apiUser?.isVerified),
});

const syncAuthUser = (apiUser) => {
  if (!apiUser) return;
  useAuth.setState((state) => ({
    user: {
      ...(state.user || {}),
      ...apiUser,
    },
  }));
};

export const useProfile = create((set, get) => ({
  user: {
    name: "",
    email: "",
    avatar: "",
    clearance: "Lvl 4",
    nodesCount: 0,
    isVerified: false,
  },
  loading: false,
  error: "",

  clearError: () => set({ error: "" }),

  fetchProfile: async () => {
    set({ loading: true, error: "" });
    try {
      const apiUser = await getCurrentUser();
      const mappedUser = toProfileUser(apiUser);
      syncAuthUser(apiUser);
      set({ user: mappedUser, loading: false, error: "" });
      return mappedUser;
    } catch (error) {
      set({ loading: false, error: error.message || "Failed to fetch profile" });
      return null;
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: "" });
    try {
      const payload = await updateUserProfile(data);
      const mappedUser = toProfileUser(payload?.user);
      syncAuthUser(payload?.user);
      set({ user: mappedUser, loading: false, error: "" });
      return payload;
    } catch (error) {
      set({ loading: false, error: error.message || "Failed to update profile" });
      return null;
    }
  },

  uploadAvatar: async (file) => {
    set({ loading: true, error: "" });
    try {
      const payload = await uploadUserAvatar(file);
      const mappedUser = toProfileUser(payload?.user);
      syncAuthUser(payload?.user);
      set({ user: mappedUser, loading: false, error: "" });
      return payload;
    } catch (error) {
      set({ loading: false, error: error.message || "Failed to upload avatar" });
      return null;
    }
  },
}));
