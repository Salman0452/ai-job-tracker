import { getToken, setAuth, clearAuth } from "./auth";
import {
  User, Resume, Application, AIResult,
  AnalyticsSummary, AdminUser, AdminStats, AdminLog
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Silent refresh on 401
  if (res.status === 401 && !path.includes("/auth/")) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        return request<T>(path, options);
      });
    }

    isRefreshing = true;
    try {
      const data = await authApi.refresh();
      setAuth(data.access_token, data.user);
      processQueue(null, data.access_token);
      return request<T>(path, options);
    } catch {
      processQueue(new Error("Session expired"), null);
      clearAuth();
      window.location.href = "/login";
      throw new Error("Session expired");
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// Auth
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    request<User>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  verifyEmail: (data: { email: string; code: string }) =>
    request<{ access_token: string; token_type: string; user: User }>(
      "/auth/verify-email",
      { method: "POST", body: JSON.stringify(data) }
    ),

  resendOtp: (email: string) =>
    request<{ message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email })
    }),

  login: async (email: string, password: string) => {
    const form = new URLSearchParams({ username: email, password });
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",   // ← sends/receives cookies
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid credentials");
    }
    return res.json() as Promise<{ access_token: string; token_type: string; user: User }>;
  },

  refresh: async () => {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",   // ← sends refresh cookie
    });
    if (!res.ok) throw new Error("Session expired");
    return res.json() as Promise<{ access_token: string; token_type: string; user: User }>;
  },

  logout: async () => {
    await fetch(`${BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },

  me: () => request<User>("/auth/me"),
  update: (data: { username?: string; password?: string }) =>
    request<User>("/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
};

// Resume
export const resumeApi = {
  upload: async (file: File) => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/resume/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json() as Promise<Resume>;
  },
  list: () => request<Resume[]>("/resume/"),
  get: (id: number) => request<Resume>(`/resume/${id}`),
  setPrimary: (id: number) => request<Resume>(`/resume/${id}/primary`, { method: "PATCH" }),
  delete: (id: number) => request<null>(`/resume/${id}`, { method: "DELETE" }),
};

// Applications
export const applicationApi = {
  create: (data: Partial<Application>) =>
    request<Application>("/applications/", { method: "POST", body: JSON.stringify(data) }),
  list: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    return request<Application[]>(`/applications/?${query}`);
  },
  get: (id: number) => request<Application>(`/applications/${id}`),
  update: (id: number, data: Partial<Application>) =>
    request<Application>(`/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => request<null>(`/applications/${id}`, { method: "DELETE" }),
};

// AI
export const aiApi = {
  trigger: (appId: number) =>
    request<{ message: string; application_id: number }>(`/ai/analyze/${appId}`, { method: "POST" }),
  results: (appId: number) => request<AIResult>(`/ai/results/${appId}`),
};

// Analytics
export const analyticsApi = {
  summary: () => request<AnalyticsSummary>("/analytics/summary"),
  skills: () => request<{ top_skills: { skill: string; count: number }[] }>("/analytics/skills"),
  timeline: () => request<{ timeline: { week: string; count: number }[] }>("/analytics/timeline"),
};

// Admin
export const adminApi = {
  users: () => request<AdminUser[]>("/admin/users"),
  updateUser: (id: number, data: { is_active: boolean }) =>
    request<AdminUser>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  stats: () => request<AdminStats>("/admin/stats"),
  logs: () => request<AdminLog[]>("/admin/logs"),
};