import Cookies from "js-cookie";
import { User } from "@/types";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const setAuth = (token: string, user: User) => {
  Cookies.set(TOKEN_KEY, token, { expires: 1 });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = (): string | null => {
  return Cookies.get(TOKEN_KEY) || null;
};

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearAuth = () => {
  Cookies.remove(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => !!getToken();