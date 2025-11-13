/**
 * Project API Service
 * Handles all HTTP requests to the backend API for projects
 */

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Map backend project data to frontend format
 */
const mapBackendToFrontend = (backendProject) => {
  // Map backend status to frontend status
  const statusMap = {
    Planning: "pending",
    "In Progress": "inProgress",
    Completed: "completed",
  };

  return {
    id: String(backendProject.id),
    name: backendProject.name,
    title: backendProject.name,
    description: backendProject.description || "",
    startingDate: backendProject.start_date
      ? formatDate(backendProject.start_date)
      : "",
    endingDate: backendProject.end_date
      ? formatDate(backendProject.end_date)
      : "",
    status: statusMap[backendProject.status] || "pending",
    taskCount: 0,
    teams: [],
    users: [],
  };
};

/**
 * Map frontend project data to backend format
 */
const mapFrontendToBackend = (frontendProject) => {
  // Map frontend status to backend status
  const statusMap = {
    pending: "Planning",
    inProgress: "In Progress",
    completed: "Completed",
  };

  const backendData = {
    name: frontendProject.name || frontendProject.title,
    description: frontendProject.description || "",
    status: statusMap[frontendProject.status] || "Planning",
  };

  // Add dates if provided
  if (frontendProject.startingDate) {
    backendData.start_date = parseDate(frontendProject.startingDate);
  }
  if (frontendProject.endingDate) {
    backendData.end_date = parseDate(frontendProject.endingDate);
  }

  return backendData;
};

/**
 * Format date from YYYY-MM-DD to MM/DD/YY
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
};

/**
 * Parse date from MM/DD/YY to YYYY-MM-DD
 */
const parseDate = (dateString) => {
  if (!dateString) return null;
  // If already in YYYY-MM-DD format, return as is
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  // Parse MM/DD/YY format
  const parts = dateString.split("/");
  if (parts.length === 3) {
    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");
    const year = "20" + parts[2];
    return `${year}-${month}-${day}`;
  }
  return null;
};

/**
 * Get all projects
 */
export const getAllProjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

/**
 * Get project by ID
 */
export const getProjectById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
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
 * Create a new project
 */
export const createProject = async (projectData) => {
  try {
    const backendData = mapFrontendToBackend(projectData);
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    const data = await response.json();
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

/**
 * Update a project
 */
export const updateProject = async (id, projectData) => {
  try {
    const backendData = mapFrontendToBackend(projectData);
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    const data = await response.json();
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    const data = await response.json();
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};
