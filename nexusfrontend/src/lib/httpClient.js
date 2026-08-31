import axios from "axios";

// 1. Base URL configuration with fallback
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

// 2. Base Axios instance
const httpClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. Request Interceptor: Attach Authorization Bearer token from localStorage
httpClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("authToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Response Interceptor: Unified error extraction
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected network error occurred.";

    return Promise.reject(new Error(customMessage));
  }
);

// Helper for extracting clean error messages from caught errors
const extractErrorMessage = (error, defaultFallback = "An unexpected error occurred.") => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    defaultFallback
  );
};

/**
 * Generic GET request wrapper
 * @param {string} url - Target URL/endpoint
 * @param {object} [params={}] - Query parameters
 * @param {object} [config={}] - Additional Axios request configuration
 * @returns {Promise<any>} Response data
 */
export async function getRequest(url, params = {}, config = {}) {
  try {
    const res = await httpClient.get(url, {
      ...config,
      params: { ...(config.params || {}), ...params },
    });
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to fetch data."));
  }
}

/**
 * Generic POST request wrapper
 * @param {string} url - Target URL/endpoint
 * @param {any} [data={}] - Request body payload
 * @param {object} [config={}] - Additional Axios request configuration
 * @returns {Promise<any>} Response data
 */
export async function postRequest(url, data = {}, config = {}) {
  try {
    const res = await httpClient.post(url, data, config);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to send request."));
  }
}

/**
 * Generic PUT request wrapper
 * @param {string} url - Target URL/endpoint
 * @param {any} [data={}] - Request body payload
 * @param {object} [config={}] - Additional Axios request configuration
 * @returns {Promise<any>} Response data
 */
export async function putRequest(url, data = {}, config = {}) {
  try {
    const res = await httpClient.put(url, data, config);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to update resource."));
  }
}

/**
 * Generic DELETE request wrapper
 * @param {string} url - Target URL/endpoint
 * @param {object} [config={}] - Additional Axios request configuration
 * @returns {Promise<any>} Response data
 */
export async function deleteRequest(url, config = {}) {
  try {
    const res = await httpClient.delete(url, config);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to delete resource."));
  }
}

/**
 * Generic Upload request wrapper (multipart/form-data)
 * @param {string} url - Target URL/endpoint
 * @param {FormData} formData - FormData object to upload
 * @param {object} [config={}] - Additional Axios request configuration
 * @returns {Promise<any>} Response data
 */
export async function uploadRequest(url, formData, config = {}) {
  try {
    const res = await httpClient.post(url, formData, {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...(config.headers || {}),
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to upload data."));
  }
}

export { httpClient };
export default httpClient;
