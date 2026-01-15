import axios from "axios";
import { logout } from "./auth";
import { showSolarToast as notify } from "./toast";

// API Base URL
const API_BASE_URL = "http://localhost:8080";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration and errors
api.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // List of routes that should NOT trigger automatic logout on 401
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                       originalRequest.url?.includes('/auth/register');

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      // Show session expired toast
      notify.warning('Your session has expired. Please login again.');

      // Logout user and redirect to login
      logout();

      return Promise.reject(error);
    }

    // Show error toast for other errors (skip for auth routes to avoid duplicates)
    if (error.response?.data?.error && !isAuthRoute) {
      notify.error(error.response.data.error);
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
