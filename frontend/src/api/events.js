import { api } from "./client";

export async function getEvents() {
  const res = await api.get("/events");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error fetching events");
  } else {
    return data;
  }
}

export async function getEventById(id) {
  const res = await api.get(`/events/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Event not found");
  } else {
    return data;
  }
}

export async function createEvent({
  title,
  description,
  date,
  image,
  category,
}) {
  const res = await api.post("/events", {
    title,
    description,
    date,
    image,
    category,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error creating event");
  } else {
    return data;
  }
}

export async function updateEvent(id, fields) {
  const res = await api.put(`/events/${id}`, fields);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error updating event");
  } else {
    return data;
  }
}

export async function deleteEvent(id) {
  const res = await api.delete(`/events/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error deleting event");
  } else {
    return data;
  }
}
