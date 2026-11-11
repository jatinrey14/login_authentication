import { fetchApi } from "./api";

export async function loginUser(email: string, password: string) {
  const data = await fetchApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
  }
  return data;
}

export async function registerUser(name: string, email: string, password: string) {
  return await fetchApi("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function logoutUser() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}