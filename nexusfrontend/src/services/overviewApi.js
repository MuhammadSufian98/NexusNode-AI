import { getRequest } from "@/lib/httpClient";

/**
 * Fetch overview dashboard statistics
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function getOverviewStats(config = {}) {
  return getRequest("/api/overview", {}, config);
}

// Aliases for compatibility
export const getStats = getOverviewStats;

export const overviewApi = {
  getOverviewStats,
  getStats,
};

export default overviewApi;
