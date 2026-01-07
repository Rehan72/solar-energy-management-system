import { useNavigate } from "react-router-dom";

// Get stored token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Get stored user
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

// Logout function - clears storage and redirects to login
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  // Redirect to login page
  window.location.href = "/login";
};

// Check if token is expired
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  
  try {
    // Decode JWT token (assuming it's a standard JWT)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    // If we can't decode, assume expired
    return true;
  }
};

// Login function - stores token and user
export const login = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};
