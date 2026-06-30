import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

// Attach JWT token from localStorage
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid/expired — clear and let app redirect
      const url = error.config?.url || "";
      if (!url.includes("/auth/login") && !url.includes("/auth/me")) {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
