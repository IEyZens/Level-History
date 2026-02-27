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

export async function getAllUsers() {
  const res = await api.get("/users");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error fetching users");
  return data;
}

export async function updateUser(id, fields) {
  const res = await api.patch(`/users/${id}`, fields);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error updating user");
  return data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Error deleting user");
  }
  return true;
}
