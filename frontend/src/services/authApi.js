/**
 * Authentication API Service
 * Handles login, signup, and user authentication requests
 */

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Get authorization headers with token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Login user
 * POST /api/auth
 * Body: { email, password }
 * Response: { accessToken }
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // Try to get error message from backend
      const errorData = await response.json().catch(() => ({}));
      
      // Backend might return validation errors in format: { errors: [{ msg: "...", ... }] }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map(err => err.msg || err.message).join(", ");
        throw new Error(errorMessages);
      }
      
      // Handle specific status codes
      if (response.status === 401) {
        throw new Error("Invalid email or password. Please check your credentials.");
      }
      
      throw new Error(errorData.message || `Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    // Backend returns { accessToken }
    return data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

/**
 * Signup/Register user
 * POST /api/register
 * Body: { name, email, password, confirmPassword }
 * Response: { success: "New user ${email} created!" }
 */
export const signup = async (name, email, password, confirmPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("User with this email already exists");
      }
      
      // Try to parse validation errors
      const errorData = await response.json().catch(() => ({}));
      
      // Backend returns validation errors in format: { errors: [{ msg: "...", ... }] }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map(err => err.msg || err.message).join(", ");
        throw new Error(errorMessages);
      }
      
      throw new Error(errorData.message || `Signup failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Signup API error:", error);
    throw error;
  }
};

/**
 * Get current user info
 * GET /api/auth/me (or similar endpoint)
 * Note: This endpoint might not exist yet, check with backend
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get current user API error:", error);
    throw error;
  }
};

/**
 * Refresh access token using refresh token from cookies
 * GET /api/refresh
 */
export const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: "GET",
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    // Backend should return { accessToken }
    return data;
  } catch (error) {
    console.error("Refresh token API error:", error);
    throw error;
  }
};

export async function googleLogin(idToken) {
  const res = await fetch(`${API_BASE_URL}/oauth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(data.message || `Google auth failed (${res.status})`);
  }
  return data; // { accessToken }
}