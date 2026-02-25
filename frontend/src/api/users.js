import { api } from "./client";

export async function getMyProfile() {
  const res = await api.get("/users/me");

  if (res.status === 401) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    return null;
  } else {
    return data;
  }
}

export async function updateMyProfile(fields) {
  const res = await api.put("/users/me", fields);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error updating profile");
  } else {
    return data;
  }
}

export async function getAdminStats() {
  const res = await api.get("/users/stats");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error fetching profile");
  } else {
    return data;
  }
}
