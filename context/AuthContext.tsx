import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AuthType = {
  user: { id: string; email: string } | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: { id: string; email: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Load session on app start
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("auth");
        if (saved) {
          const parsed = JSON.parse(saved);
          setToken(parsed.token);
          setUser(parsed.user);
        }
      } catch (e) {
        console.log("Error loading auth:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (token: string, userData: { id: string; email: string }) => {
    const authData = { token, user: userData };
    await AsyncStorage.setItem("auth", JSON.stringify(authData));
    setToken(token);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("auth");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
