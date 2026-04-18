import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await getMe();
      setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [token, refreshUser]);

  const loginSuccess = useCallback((newToken, profile) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(profile);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      loginSuccess,
      logout,
      refreshUser,
      isAuthenticated: Boolean(user && token),
    }),
    [user, token, loading, loginSuccess, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
