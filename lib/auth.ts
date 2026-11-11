import { apiClient } from "./api";
import { CONFIG } from "./config";

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS?.ACCESS_TOKEN || "token");
  if (!token || token === "undefined" || token === "null") return null;
  return token;
};

export const setTokens = (accessToken?: string, refreshToken?: string): void => {
  if (typeof window === "undefined") return;
  if (accessToken && accessToken !== "undefined") {
    localStorage.setItem(CONFIG.STORAGE_KEYS?.ACCESS_TOKEN || "token", accessToken);
  } else {
    localStorage.removeItem(CONFIG.STORAGE_KEYS?.ACCESS_TOKEN || "token");
  }
};

export const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONFIG.STORAGE_KEYS?.ACCESS_TOKEN || "token");
  localStorage.removeItem(CONFIG.STORAGE_KEYS?.REFRESH_TOKEN || "refreshToken");
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export async function loginUser(email: string, password: string) {
  const data: any = await apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: email, password }),
  });
  const token = data.access_token || data.accessToken;
  if (token) {
    setTokens(token);
  }
  return data;
}

export async function registerUser(name: string, email: string, password: string) {
  return await apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username: email, password }),
  });
}

export function logoutUser() {
  clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}