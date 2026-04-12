// 1. Get the raw value
const rawUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const isProduction = process.env.NODE_ENV === "production";

// 2. Determine the base (Only fallback if we are NOT in production)
const fallbackUrl = isProduction ? "" : "http://localhost:5000";
const API_BASE_URL = (rawUrl || fallbackUrl).replace(/\/$/, "");

// 3. Add a "Sanity Check" for your logs (Development only)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔌 API Mode:", API_BASE_URL);
}

if (!rawUrl && isProduction && typeof window !== "undefined") {
  console.error(
    "NEXT_PUBLIC_API_BASE_URL is missing in production. Set it to your Render backend URL.",
  );
}

export default API_BASE_URL;