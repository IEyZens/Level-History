import { api } from "./client";

export async function toggleLike(type, id) {
  const res = await api.post(`/likes/${type}/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error toggling like");
  } else {
    return data;
  }
}
