import { api } from "./client";

export async function getCommentsByEvent(eventId) {
  const res = await api.get(`/comments/event/${eventId}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error fetching comments");
  } else {
    return data;
  }
}

export async function createComment(eventId, content) {
  const res = await api.post(`/comments/event/${eventId}`, { content });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error creating comment");
  } else {
    return data;
  }
}

export async function updateComment(id, content) {
  const res = await api.put(`/comments/${id}`, { content });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error updating comment");
  } else {
    return data;
  }
}

export async function deleteComment(id) {
  const res = await api.delete(`/comments/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error deleting comment");
  } else {
    return data;
  }
}
