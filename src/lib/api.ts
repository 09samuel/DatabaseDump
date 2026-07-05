import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

let isLoggingOut = false;

const handleLogout = async () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  try {
    await api.post("/auth/logout");
  } catch {
    // Ignore error since token might already be invalid
  } finally {
    window.location.href = "/login";
  }
};

interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;

  //prevent infinite loop for refresh/logout
  if (
    originalRequest.url?.includes("/auth/refresh") ||
    originalRequest.url?.includes("/auth/logout")
  ) {
    return Promise.reject(error);
  }

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(api(originalRequest)),
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      await api.post("/auth/refresh");

      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      // logout flow
      await handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
}
);