"use client";

import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState("login"); // "login" or "signup"
  const [direction, setDirection] = useState(0);

  const switchView = (view) => {
    setDirection(view === "signup" ? 1 : -1);
    setAuthView(view);
  };

  const login = (data) => setUser({ name: "User", ...data });
  const signup = (data) => setUser({ name: data.name, ...data });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, authView, direction, switchView, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
