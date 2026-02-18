import { api } from "./client";

export async function getPersonalities() {
  const res = await api.get("/personalities");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error fetching personalities");
  } else {
    return data;
  }
}

export async function getPersonalityById(id) {
  const res = await api.get(`/personalities/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Personality not found");
  } else {
    return data;
  }
}

export async function deletePersonality(id) {
  const res = await api.delete(`/personalities/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error deleting personality");
  } else {
    return data;
  }
}
