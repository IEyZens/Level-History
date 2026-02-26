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

export async function createPersonality(formData) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/personalities`,
    {
      method: "POST",
      credentials: "include",
      body: formData, // FormData, pas JSON
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error creating personality");
  return json;
}

export async function updatePersonality(id, formData) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/personalities/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      body: formData, // FormData, pas JSON
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error updating personality");
  return json;
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
