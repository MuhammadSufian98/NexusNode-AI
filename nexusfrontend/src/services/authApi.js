import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
  uploadRequest,
} from "@/lib/httpClient";

export async function verifyEmailOtp(email) {
  return postRequest("/api/auth/verify-email", { email });
}

export async function registerUser({ email, password, full_name, code }) {
  return postRequest("/api/auth/register", { email, password, full_name, code });
}

export async function loginUser({ email, password }) {
  return postRequest("/api/auth/login", { email, password });
}

export async function getCurrentUser() {
  return getRequest("/api/profile/me");
}

export async function logoutUser() {
  return postRequest("/api/auth/logout");
}

export async function updateUserProfile({ full_name, email }) {
  return patchRequest("/api/profile", { full_name, email });
}

export async function uploadUserAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  return uploadRequest("/api/profile/avatar", formData);
}

export async function deleteUserAvatar() {
  return deleteRequest("/api/profile/avatar");
}

export const authApi = {
  verifyEmailOtp,
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateUserProfile,
  uploadUserAvatar,
  deleteUserAvatar,
};

export default authApi;
