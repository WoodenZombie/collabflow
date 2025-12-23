/**
 * Project API Service
 * Handles all HTTP requests to the backend API for projects
 * Uses routes: /api/projects
 */

import { getAuthHeaders } from "./authApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Map backend status to frontend status
 * Backend: 'Planning', 'In Progress', 'Completed'
 * Frontend: 'pending', 'inProgress', 'completed'
 */
const mapBackendStatusToFrontend = (backendStatus) => {
  const statusMap = {
    Planning: "pending",
    "In Progress": "inProgress",
    Completed: "completed",
  };
  return statusMap[backendStatus] || "pending";
};

/**
 * Format date from backend (YYYY-MM-DD) to frontend format (MM/DD/YY)
 */
const formatDateForFrontend = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "";
  }
};

/**
 * Map backend project data to frontend format
 * Backend projects have: id, name, description, start_date, end_date, status, team_id, created_by, created_at
 * Frontend expects: id, title, description, participants, progress
 */
const mapBackendToFrontend = (backendProject) => {
  return {
    id: String(backendProject.id),
    name: backendProject.name || "",
    title: backendProject.name || "Untitled Project",
    description: backendProject.description || "",
    startingDate: formatDateForFrontend(backendProject.start_date),
    endingDate: formatDateForFrontend(backendProject.end_date),
    status: mapBackendStatusToFrontend(backendProject.status),
    participants: [], // Will be populated if user/team data is available
    progress: {
      waiting: 0,
      inProgress: 0,
      done: 0,
    },
    // Keep backend fields for reference
    team_id: backendProject.team_id,
    created_by: backendProject.created_by,
    created_at: backendProject.created_at,
  };
};

/**
 * Convert date from frontend format (YYYY-MM-DD from date input or MM/DD/YY) to backend format (YYYY-MM-DD)
 */
const formatDateForBackend = (dateString) => {
  if (!dateString) return null;

  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Try to parse MM/DD/YY format
  try {
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const month = parts[0].padStart(2, "0");
      const day = parts[1].padStart(2, "0");
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      return `${year}-${month}-${day}`;
    }

    // Try parsing as Date object
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.warn("Error formatting date for backend:", error);
  }

  return null;
};

/**
 * Map frontend project data to backend format
 * Frontend: title, description, startingDate, endingDate, teams, users
 * Backend: name, description, start_date, end_date, status, team_id, created_by
 */
const mapFrontendToBackend = (frontendProject) => {
  const backendData = {
    name: frontendProject.title || frontendProject.name || "",
    description: frontendProject.description || "",
  };

  // Add dates if provided
  if (frontendProject.startingDate) {
    const startDate = formatDateForBackend(frontendProject.startingDate);
    if (startDate) {
      backendData.start_date = startDate;
    }
  }

  if (frontendProject.endingDate) {
    const endDate = formatDateForBackend(frontendProject.endingDate);
    if (endDate) {
      backendData.end_date = endDate;
    }
  }

  // Add status if provided (defaults to 'Planning' in backend)
  if (frontendProject.status) {
    const statusMap = {
      pending: "Planning",
      inProgress: "In Progress",
      completed: "Completed",
    };
    backendData.status = statusMap[frontendProject.status] || "Planning";
  }

  // Note: teams and users arrays are not stored in projects table
  // They would need separate tables/endpoints if needed

  // Allow setting team_id when linking a team to a project
  if (frontendProject.team_id) {
    const teamIdNum = typeof frontendProject.team_id === "string" ? parseInt(frontendProject.team_id) : frontendProject.team_id;
    if (!isNaN(teamIdNum)) {
      backendData.team_id = teamIdNum;
    }
  }

  return backendData;
};

/**
 * Get all projects from backend
 * Fetches projects from /api/projects endpoint
 */
export const getAllProjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      if (response.status === 500) {
        console.warn(
          "Backend returned 500, returning empty array. Projects table might not exist."
        );
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Handle case when data is not an array
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Error fetching projects:", error);
    // Return empty array instead of throwing, so UI doesn't break
    return [];
  }
};

/**
 * Get project by ID
 * @param {number} projectId - Project ID
 */
export const getProjectById = async (projectId) => {
  try {
    if (!projectId) {
      throw new Error("projectId is required");
    }

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};

/**
 * Delete a project
 * @param {number} projectId - Project ID
 */
export const deleteProject = async (projectId) => {
  try {
    if (!projectId) {
      throw new Error("projectId is required");
    }

    const projectIdNum = typeof projectId === "string" ? parseInt(projectId) : projectId;
    const response = await fetch(`${API_BASE_URL}/projects/${projectIdNum}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

/**
 * Create a new project
 * @param {object} projectData - Project data from frontend form
 */
export const createProject = async (projectData) => {
  try {
    console.log("createProject called with projectData:", projectData);

    const backendData = mapFrontendToBackend(projectData);
    console.log("Mapped backendData:", backendData);

    // Check token before making request
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);
    console.log("Token length:", token ? token.length : 0);
    if (token) {
      // Try to decode token to check expiration
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log("Token payload:", tokenPayload);
        const expirationTime = tokenPayload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        console.log("Token expiration:", new Date(expirationTime));
        console.log("Current time:", new Date(currentTime));
        console.log("Token expired:", currentTime > expirationTime);
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }

    const headers = getAuthHeaders();
    console.log("Request headers:", { ...headers, Authorization: headers.Authorization ? "Bearer ***" : "none" });

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: headers,
      credentials: "include",
      body: JSON.stringify(backendData),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (response.status === 403) {
      // Token might be expired or invalid
      console.error("403 Forbidden - Token might be expired or invalid");
      const errorData = await response.json().catch(() => ({}));
      console.error("403 Error response:", errorData);

      // Clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error response data:", errorData);

      // Build detailed error message
      let errorMessage = `HTTP error! status: ${response.status}`;

      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        const validationErrors = errorData.errors.map(e => e.msg || e.message || JSON.stringify(e)).join(", ");
        errorMessage = validationErrors || errorMessage;
      }

      console.error("Throwing error:", errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("createProject response:", data);
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error creating project:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Update a project
 * @param {string|number} projectId - Project ID
 * @param {object} projectData - Updated project data from frontend form
 */
export const updateProject = async (projectId, projectData) => {
  try {
    console.log("updateProject called with projectId:", projectId, "projectData:", projectData);

    const projectIdNum = typeof projectId === "string" ? parseInt(projectId) : projectId;
    const backendData = mapFrontendToBackend(projectData);
    console.log("Mapped backendData:", backendData);

    const response = await fetch(`${API_BASE_URL}/projects/${projectIdNum}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("updateProject response:", data);
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};
