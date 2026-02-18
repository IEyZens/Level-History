import { api } from "./client";

export async function register({ username, email, password }) {
  const res = await api.post("/auth/register", { username, email, password });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error during registration");
  } else {
    return data;
  }
}

export async function login({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Incorrect email or password");
  } else {
    return data;
  }
}

export async function logout() {
  const res = await api.post("/auth/logout");

  if (!res.ok) {
    throw new Error("Error during logout");
  } else {
    return true;
  }
}

export async function getMe() {
  const res = await api.get("/auth/me");

  if (res.status === 401) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    return null;
  } else {
    return data.data;
  }
}
