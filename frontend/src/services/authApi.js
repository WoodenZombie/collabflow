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
 * Tries multiple possible endpoints:
 * - POST /api/auth/login
 * - POST /api/users/login
 * Body: { email, password }
 */
export const login = async (email, password) => {
  const endpoints = [
    `${API_BASE_URL}/auth/login`,
    `${API_BASE_URL}/users/login`,
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`Attempting login at: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log(`Response from ${endpoint}:`, response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log(`Success! Login worked at: ${endpoint}`);
        return data;
      }

      // If 404, try next endpoint
      if (response.status === 404) {
        console.log(`404 from ${endpoint}, trying next...`);
        continue;
      }

      // For other errors, get error message
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Login failed: ${response.status} ${response.statusText}`);
    } catch (error) {
      // Network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error(`Network error for ${endpoint}:`, error.message);
        throw new Error("Network error: Could not connect to server. Please check if backend is running.");
      }
      
      // If it's not a 404, throw immediately
      if (!error.message.includes("404") && !error.message.includes("Not Found")) {
        throw error;
      }
      
      lastError = error;
      continue;
    }
  }

  // If all endpoints failed
  throw new Error(
    `Login endpoint not found. Tried: ${endpoints.join(", ")}. ` +
    `Please check with backend developer which endpoint is correct.`
  );
};

/**
 * Signup/Register user
 * Tries multiple possible endpoints:
 * - POST /api/auth/register
 * - POST /api/auth/signup
 * - POST /api/users/register
 * - POST /api/users/signup
 * Body: { name, email, password }
 */
export const signup = async (name, email, password) => {
  const endpoints = [
    `${API_BASE_URL}/auth/register`,
    `${API_BASE_URL}/auth/signup`,
    `${API_BASE_URL}/users/register`,
    `${API_BASE_URL}/users/signup`,
  ];

  const attemptedEndpoints = [];
  let lastError = null;

  for (const endpoint of endpoints) {
    attemptedEndpoints.push(endpoint);
    try {
      console.log(`Attempting signup at: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      console.log(`Response from ${endpoint}:`, response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log(`Success! Signup worked at: ${endpoint}`);
        return data;
      }

      // If 404, try next endpoint
      if (response.status === 404) {
        console.log(`404 from ${endpoint}, trying next...`);
        continue;
      }

      // For other HTTP errors, try to get error message
      const errorData = await response.json().catch(() => ({}));
      lastError = new Error(errorData.message || `Signup failed: ${response.status} ${response.statusText}`);
      
      // If it's a validation error (400, 422), throw immediately
      if (response.status === 400 || response.status === 422) {
        throw lastError;
      }
      
      // For other errors, continue trying
      continue;
    } catch (error) {
      // Network errors or fetch failures
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error(`Network error for ${endpoint}:`, error.message);
        throw new Error("Network error: Could not connect to server. Please check if backend is running.");
      }
      
      // If it's a validation error, throw immediately
      if (error.message && !error.message.includes("404") && !error.message.includes("Not Found")) {
        throw error;
      }
      
      lastError = error;
      continue;
    }
  }

  // If all endpoints failed with 404
  const errorMessage = `Signup endpoint not found. Tried endpoints:\n${attemptedEndpoints.map(e => `- ${e}`).join("\n")}\n\nPlease check with backend developer which endpoint is correct.`;
  console.error(errorMessage);
  throw new Error(errorMessage);
};

/**
 * Get current user info
 * GET /api/auth/me
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getAuthHeaders(),
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
