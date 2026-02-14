"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: any | null;
  isAuth: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  login: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/auth/profile", { headers: { 'Cache-Control' : 'no-cache'}})
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
  }

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Log out failed", err);
    } finally {
      setUser(null);
    }
  }

  if (loading) return null; // prevents flicker

  return (
    <AuthContext.Provider value={{ user, isAuth: !!user, loading, logout, login}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
