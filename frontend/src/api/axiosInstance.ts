import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Backend API URL
  withCredentials: true, // Ensures cookies are sent with requests
});

// 📌 Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Get token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 📌 Handle expired tokens (401) and attempt refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Request new access token using refresh token
        const { data } = await api.post("/auth/refresh", {});

        // Store new token and retry request
        localStorage.setItem("token", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest); // Retry failed request with new token
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        localStorage.removeItem("token"); // Clear expired token
        window.location.href = "/login"; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
