"use client";

import { create } from "zustand";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  verifyEmailOtp,
} from "@/utils/authApi";

const defaultLoginForm = {
  email: "",
  password: "",
};

const defaultSignupForm = {
  alias: "",
  email: "",
  password: "",
};

const defaultOtp = ["", "", "", "", "", ""];

export const useAuth = create((set, get) => ({
    hydrated: false,

  user: null,
  isAuthenticated: false,
  authChecked: false,

  authView: "login",
  direction: 0,

  loginForm: { ...defaultLoginForm },
  signupForm: { ...defaultSignupForm },
  signupStep: "register",
  verificationCode: [...defaultOtp],

  loginShowPass: false,
  signupShowPass: false,

  loading: false,
  error: "",

  clearError: () => set({ error: "" }),

  switchView: (view) =>
    set({
      direction: view === "signup" ? 1 : -1,
      authView: view,
      signupStep: "register",
      verificationCode: [...defaultOtp],
      loginShowPass: false,
      signupShowPass: false,
      error: "",
    }),

  setLoginField: (field, value) =>
    set((state) => ({
      loginForm: {
        ...state.loginForm,
        [field]: value,
      },
    })),

  setSignupField: (field, value) =>
    set((state) => ({
      signupForm: {
        ...state.signupForm,
        [field]: value,
      },
    })),

  setVerificationDigit: (index, value) =>
    set((state) => {
      const next = [...state.verificationCode];
      next[index] = value;
      return { verificationCode: next };
    }),

  toggleLoginPass: () => set((state) => ({ loginShowPass: !state.loginShowPass })),
  toggleSignupPass: () =>
    set((state) => ({ signupShowPass: !state.signupShowPass })),

  setSignupStep: (step) => set({ signupStep: step, error: "" }),

  requestVerificationCode: async () => {
    const { signupForm } = get();
    set({ loading: true, error: "" });
    try {
      await verifyEmailOtp(signupForm.email);
      set({ signupStep: "verify", loading: false, error: "" });
      return true;
    } catch (err) {
      set({ loading: false, error: err.message || "Failed to send code" });
      return false;
    }
  },

  verifyAndRegister: async () => {
    const { signupForm, verificationCode } = get();
    set({ loading: true, error: "" });
    try {
      const code = verificationCode.join("");

      await registerUser({
        email: signupForm.email,
        password: signupForm.password,
        full_name: signupForm.alias,
        code,
      });

      const loginPayload = await loginUser({
        email: signupForm.email,
        password: signupForm.password,
      });

      set({
        user: loginPayload?.user || null,
        isAuthenticated: true,
        authChecked: true,
        loading: false,
        error: "",
      });

      return true;
    } catch (err) {
      set({ loading: false, error: err.message || "Verification failed" });
      return false;
    }
  },

  login: async () => {
    const { loginForm } = get();
    set({ loading: true, error: "" });
    try {
      const payload = await loginUser({
        email: loginForm.email,
        password: loginForm.password,
      });

      set({
        user: payload?.user || null,
        isAuthenticated: true,
        authChecked: true,
        loading: false,
        error: "",
      });

      return true;
    } catch (err) {
      set({ loading: false, error: err.message || "Login failed" });
      return false;
    }
  },

  fetchMe: async () => {
    set({ loading: true, error: "" });
    try {
      const user = await getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        authChecked: true,
        hydrated: true,
        loading: false,
      });
      return user;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        authChecked: true,
        hydrated: true,
        loading: false,
      });
      return null;
    }
  },

  hydrateSession: async () => {
    if (get().hydrated && get().authChecked) return get().user;
    if (get().hydrated) return get().user;
    return get().fetchMe();
  },

  resetAuthFlow: () =>
    set({
      loginForm: { ...defaultLoginForm },
      signupForm: { ...defaultSignupForm },
      verificationCode: [...defaultOtp],
      signupStep: "register",
      loginShowPass: false,
      signupShowPass: false,
      loading: false,
      error: "",
    }),

  logout: async () => {
    set({ loading: true, error: "" });
    try {
      await logoutUser();
    } catch {
      // Even if backend logout fails, force local auth reset.
    }

    set({
      user: null,
      isAuthenticated: false,
      authChecked: true,
      hydrated: true,
      loginForm: { ...defaultLoginForm },
      signupForm: { ...defaultSignupForm },
      verificationCode: [...defaultOtp],
      signupStep: "register",
      loginShowPass: false,
      signupShowPass: false,
      loading: false,
      error: "",
    });
  },
}));