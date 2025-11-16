/**
 * Task API Service
 * Handles all HTTP requests to the backend API for tasks
 */

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Map backend task data to frontend format
 */
const mapBackendToFrontend = (backendTask) => {
  // Map backend status to frontend status
  const statusMap = {
    Planning: "pending",
    "In Progress": "inProgress",
    Completed: "completed",
  };

  return {
    id: String(backendTask.id),
    name: backendTask.name,
    title: backendTask.name,
    description: backendTask.description || "",
    startingDate: backendTask.start_date
      ? formatDate(backendTask.start_date)
      : "",
    endingDate: backendTask.end_date ? formatDate(backendTask.end_date) : "",
    status: statusMap[backendTask.status] || "pending",
    taskCount: 0,
    teams: [],
    users: [],
  };
};

/**
 * Map frontend task data to backend format
 */
const mapFrontendToBackend = (frontendTask) => {
  // Map frontend status to backend status
  const statusMap = {
    pending: "Planning",
    inProgress: "In Progress",
    completed: "Completed",
  };

  const backendData = {
    name: frontendTask.name || frontendTask.title,
    description: frontendTask.description || "",
    status: statusMap[frontendTask.status] || "Planning",
  };

  // Add dates if provided
  if (frontendTask.startingDate) {
    backendData.start_date = parseDate(frontendTask.startingDate);
  }
  if (frontendTask.endingDate) {
    backendData.end_date = parseDate(frontendTask.endingDate);
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
 * Get all tasks
 * Fetches all projects from /api/projects endpoint
 */
export const getAllTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

/**
 * Get task by ID
 */
export const getTaskById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
};

/**
 * Create a new task
 */
export const createTask = async (taskData) => {
  try {
    const backendData = mapFrontendToBackend(taskData);
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
    console.error("Error creating task:", error);
    throw error;
  }
};

/**
 * Update a task
 */
export const updateTask = async (id, taskData) => {
  try {
    const backendData = mapFrontendToBackend(taskData);
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
    console.error("Error updating task:", error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (id) => {
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
    console.error("Error deleting task:", error);
    throw error;
  }
};
