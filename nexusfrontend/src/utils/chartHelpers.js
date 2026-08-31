/**
 * @file Chart color palettes and dynamic radius calculations for responsive Recharts.
 */

/**
 * Standard vibrant gradient palette for NexusNode charts
 */
export const PIE_COLORS = Object.freeze([
  "#e11d48", // Rose 600
  "#f97316", // Orange 500
  "#f59e0b", // Amber 500
  "#0ea5e9", // Sky 500
  "#10b981", // Emerald 500
  "#8b5cf6", // Violet 500
  "#ec4899", // Pink 500
]);

/**
 * Calculates dynamic inner and outer radii for responsive Recharts pie charts
 * @param {number} width - Container client width
 * @param {number} height - Container client height
 * @param {object} [options={}] - Custom proportion multipliers
 * @param {number} [options.innerRatio=0.22] - Inner radius ratio
 * @param {number} [options.outerRatio=0.38] - Outer radius ratio
 * @param {number} [options.minOuter=24] - Minimum outer radius
 * @param {number} [options.maxOuter=140] - Maximum outer radius
 * @returns {{ innerRadius: number, outerRadius: number, canRender: boolean }}
 */
export function calculatePieRadii(
  width,
  height,
  {
    innerRatio = 0.22,
    outerRatio = 0.38,
    minOuter = 24,
    maxOuter = 140,
  } = {}
) {
  if (!width || !height || width <= 0 || height <= 0) {
    return { innerRadius: 0, outerRadius: 0, canRender: false };
  }

  const dimension = Math.min(width, height);
  const outerRadius = Math.max(
    minOuter,
    Math.min(maxOuter, Math.floor(dimension * outerRatio))
  );
  const innerRadius = Math.floor(outerRadius * (innerRatio / outerRatio));

  return {
    innerRadius,
    outerRadius,
    canRender: true,
  };
}

/**
 * Formats value as a percentage
 * @param {number} value - Numerator
 * @param {number} [total=100] - Denominator
 * @param {number} [decimals=0] - Precision
 * @returns {number} Percentage (0-100)
 */
export function formatPercentage(value, total = 100, decimals = 0) {
  if (!total || isNaN(value) || isNaN(total)) return 0;
  const ratio = (Number(value) / Number(total)) * 100;
  return Number(ratio.toFixed(decimals));
}

export const chartHelpers = {
  PIE_COLORS,
  calculatePieRadii,
  formatPercentage,
};

export default chartHelpers;
