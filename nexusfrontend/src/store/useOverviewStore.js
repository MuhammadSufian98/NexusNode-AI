"use client";

import { create } from "zustand";
import { overviewApi } from "@/services/overviewApi";
import { createInitialOverview, formatOverviewStats } from "@/types/schemas";

/**
 * Domain store for Overview Analytics and Dashboard Metrics
 */
export const useOverviewStore = create((set) => ({
  overviewData: createInitialOverview(),
  isLoading: false,

  setOverviewData: (updater) =>
    set((state) => ({
      overviewData:
        typeof updater === "function" ? updater(state.overviewData) : updater,
    })),

  fetchOverviewData: async () => {
    try {
      set({ isLoading: true });
      const res = await overviewApi.getOverviewStats();
      const rawData = res.data || res;
      const formatted = formatOverviewStats(rawData);

      set({
        overviewData: formatted,
        isLoading: false,
      });
      return formatted;
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to load overview data:", error.message);
      return null;
    }
  },
}));

export default useOverviewStore;
