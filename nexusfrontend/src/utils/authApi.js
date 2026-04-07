import API_BASE_URL from "@/lib/apiBaseUrl";

async function request(path, options = {}) {
  const isFormDataBody =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export async function verifyEmailOtp(email) {
  return request("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function registerUser({ email, password, full_name, code }) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name, code }),
  });
}

export async function loginUser({ email, password }) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser() {
  return request("/api/profile/me", {
    method: "GET",
  });
}

export async function logoutUser() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export async function updateUserProfile({ full_name, email }) {
  return request("/api/profile", {
    method: "PATCH",
    body: JSON.stringify({ full_name, email }),
  });
}

export async function uploadUserAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  return request("/api/profile/avatar", {
    method: "POST",
    body: formData,
  });
}
