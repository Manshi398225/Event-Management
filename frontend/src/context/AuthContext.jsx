import { createContext, useEffect, useState } from "react";
import { apiRequest } from "../api/client";

export const AuthContext = createContext(null);

const STORAGE_KEY = "ems-auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { token: null, user: null };
  });
  const [loading, setLoading] = useState(false);

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    const handleExpiredSession = () => {
      logout();
    };

    window.addEventListener("auth:expired", handleExpiredSession);
    return () => window.removeEventListener("auth:expired", handleExpiredSession);
  }, []);

  const login = async (payload) => {
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: payload,
      });
      setAuth({ token: data.token, user: data.user });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: payload,
      });
      setAuth({ token: data.token, user: data.user });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (payload) => {
    setLoading(true);
    try {
      const data = await apiRequest("/auth/profile", {
        method: "PUT",
        token: auth.token,
        body: payload,
      });
      setAuth({ token: data.token, user: data.user });
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        user: auth.user,
        isAuthenticated: Boolean(auth.token),
        loading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
