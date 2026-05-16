"use client";
import { useEffect, useState } from "react";
import { getUser, clearAuth, isAuthenticated } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { authApi } from "@/lib/api";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setAuthenticated(isAuthenticated());
  }, []);

  const logout = async () => {
    await authApi.logout();
    clearAuth();
    setUser(null);
    setAuthenticated(false);
    router.push("/login");
  };

  return { user, authenticated, logout };
}