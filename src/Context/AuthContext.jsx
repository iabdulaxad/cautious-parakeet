import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../api/methods";
import { tokenStore, setSessionExpiredHandler } from "../api/client";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setRole("");
    setProfile(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const data = await api.getMe();
    setUser(data?.user || null);
    setRole(data?.role || "");
    setProfile(data?.profile || null);
    return data;
  }, []);

  // Wire the API client so an unrecoverable 401 logs the user out.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      logout();
      toast.info("Your session expired, please sign in again.");
    });
  }, [logout]);

  // Restore the session on first load if a token is present.
  useEffect(() => {
    let active = true;
    (async () => {
      if (tokenStore.access()) {
        try {
          await refreshMe();
        } catch {
          tokenStore.clear();
        }
      }
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [refreshMe]);

  const login = useCallback(async (loginId, password) => {
    const data = await api.login(loginId, password);
    const token = data?.token;
    if (!token?.access_token) throw new Error("No token returned");
    tokenStore.set(token.access_token, token.refresh_token);
    setUser(data?.user || null);
    setRole(data?.role || "");
    // Pull the full profile (doctor/patient row) in the background.
    refreshMe().catch(() => {});
    return data?.role || "";
  }, [refreshMe]);

  const value = {
    user,
    role,
    profile,
    ready,
    isAuthenticated: !!user,
    login,
    logout,
    refreshMe,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
