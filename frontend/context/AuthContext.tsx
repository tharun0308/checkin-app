"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { setToken, getToken, removeToken } from "../lib/api";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for token on mount
    const storedToken = getToken();
    if (storedToken) {
      setTokenState(storedToken);
    } else if (pathname !== "/login") {
      router.push("/login");
    }
    setIsLoading(false);
  }, [pathname, router]);

  const login = (newToken: string) => {
    setToken(newToken);
    setTokenState(newToken);
    router.push("/");
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    router.push("/login");
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
