const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
let authStore = null;

async function getAuthStore() {
  if (authStore) {
    return authStore;
  } else {
    const module = await import("../context/AuthContext");
    authStore = module;
  }

  return authStore;
}

async function tryRefreshToken() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    return res.ok;
  } catch {
    return false;
  }
}

export default async function apiClient(endpoint, options = {}, retry = true) {
  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
      return apiClient(endpoint, options, false);
    } else {
      const store = await getAuthStore();
      store.clearUser();
      window.location.href = "/login";
      return res;
    }
  }

  return res;
}

export const api = {
  get: (endpoint) => apiClient(endpoint),

  post: (endpoint, body) =>
    apiClient(endpoint, { method: "POST", body: JSON.stringify(body) }),

  put: (endpoint, body) =>
    apiClient(endpoint, { method: "PUT", body: JSON.stringify(body) }),

  delete: (endpoint) => apiClient(endpoint, { method: "DELETE" }),
};
