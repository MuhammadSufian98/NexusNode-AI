// 1. Get the raw value
const rawUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// 2. Determine the base (Only fallback if we are NOT in production)
const API_BASE_URL = (rawUrl || "http://localhost:5000").replace(/\/$/, "");

// 3. Add a "Sanity Check" for your logs (Development only)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔌 API Mode:", API_BASE_URL);
}

export default API_BASE_URL;