import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// --- Request interceptor: attach token from localStorage ---
client.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response interceptor: global error handling ---
// WILL handle 401 centrally (unauthenticated), and pass other errors along.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // If no response, network error
    if (!error.response) {
      // network or CORS error
      return Promise.reject({ isNetworkError: true, message: error.message || "Network error" });
    }

    const status = error.response.status;

    // 401 Unauthorized -> clear storage and redirect to login
    if (status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {}
      // Optionally show a toast here or use some global store
      // Force redirect to login page (client-side)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      // return a rejected promise so callers know
      return Promise.reject({ status, message: "Not authenticated" });
    }

    // Map other server errors into readable format
    let payload = error.response.data;
    let message = "Request failed";
    if (payload) {
      if (typeof payload === "string") message = payload;
      else if (payload.detail) message = payload.detail;
      else if (payload.message) message = payload.message;
      else message = JSON.stringify(payload);
    }
    return Promise.reject({ status, message, payload });
  }
);

// --- Convenience wrappers that mimic previous API function names ---
// GET
export async function apiGet(path) {
  try {
    const res = await client.get(path);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// POST
export async function apiPost(path, data) {
  try {
    const res = await client.post(path, data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// PUT
export async function apiPut(path, data) {
  try {
    const res = await client.put(path, data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// DELETE
export async function apiDelete(path) {
  try {
    const res = await client.delete(path);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// Auth variants are not strictly necessary with interceptors (they auto add token).
// But keep the functions for explicit use if you want to pass a token manually.

export async function apiGetAuth(path, token) {
  try {
    const res = await client.get(path, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function apiPostAuth(path, data, token) {
  try {
    const res = await client.post(path, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function apiPutAuth(path, data, token) {
  try {
    const res = await client.put(path, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function apiDeleteAuth(path, token) {
  try {
    const res = await client.delete(path, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
}
