/**
 * Task API Service
 * Handles all HTTP requests to the backend API for tasks
 * Uses nested routes: /api/projects/:projectId/tasks
 */

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Map status_id to frontend status string
 * Backend uses status_id (1, 2, 3, 4) which maps to statuses table
 * Frontend expects: "pending", "inProgress", "completed"
 * Default mapping: 1 = pending, 2 = inProgress, 3 = review, 4 = completed
 */
const mapStatusIdToStatus = (statusId) => {
  const statusMap = {
    1: "pending", // To Do
    2: "inProgress", // In Progress
    3: "pending", // Review (treating as pending)
    4: "completed", // Done
  };
  return statusMap[statusId] || "pending";
};

/**
 * Map backend task data to frontend format
 * Backend tasks have: id, title, description, priority, status_id, project_id, due_date, created_by, created_at, updated_at
 */
const mapBackendToFrontend = (backendTask) => {
  return {
    id: String(backendTask.id),
    name: backendTask.title,
    title: backendTask.title,
    description: backendTask.description || "",
    startingDate: "",
    endingDate: backendTask.due_date || "",
    status: mapStatusIdToStatus(backendTask.status_id),
    priority: backendTask.priority || "Medium",
    taskCount: 0,
    teams: [],
    users: [],
    list_id: backendTask.project_id, // For compatibility
    project_id: backendTask.project_id,
    status_id: backendTask.status_id, // Keep original for updates
  };
};

/**
 * Convert date string to YYYY-MM-DD format (for MySQL DATE column)
 * Handles ISO datetime strings, YYYY-MM-DD format, MM/DD/YY format, and null/empty values
 */
const formatDateForBackend = (dateString) => {
  if (!dateString) return null;

  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Try to parse the date string (handles ISO datetime, MM/DD/YY, etc.)
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Try parsing MM/DD/YY format manually
      const mmddyyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
      if (mmddyyMatch) {
        const [, month, day, year] = mmddyyMatch;
        const fullYear = year.length === 2 ? `20${year}` : year;
        return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
      return null;
    }

    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn("Error formatting date:", error);
    return null;
  }
};

/**
 * Map frontend task data to backend task format
 * Backend expects: title, description, priority (optional), status_id (optional), due_date (DATE format)
 */
const mapFrontendToBackend = (frontendTask) => {
  const backendData = {
    title: frontendTask.name || frontendTask.title,
    description: frontendTask.description || "",
  };

  // Add priority if provided
  if (frontendTask.priority) {
    backendData.priority = frontendTask.priority;
  }

  // Map frontend status to status_id if provided
  if (frontendTask.status) {
    const statusToIdMap = {
      pending: 1,
      inProgress: 2,
      completed: 4,
    };
    backendData.status_id = statusToIdMap[frontendTask.status] || 1;
  }

  // Add due_date if endingDate is provided, convert to DATE format (YYYY-MM-DD)
  if (frontendTask.endingDate) {
    const formattedDate = formatDateForBackend(frontendTask.endingDate);
    if (formattedDate) {
      backendData.due_date = formattedDate;
    }
  }

  return backendData;
};

/**
 * Get all tasks for a project
 * Fetches tasks from /api/projects/:projectId/tasks endpoint
 * @param {number} projectId - Required project ID to fetch tasks for
 */
export const getAllTasks = async (projectId) => {
  try {
    if (!projectId) {
      console.warn("getAllTasks: projectId is required");
      return [];
    }

    const url = `${API_BASE_URL}/projects/${projectId}/tasks`;
    const response = await fetch(url);
    if (!response.ok) {
      // If 500 error, return empty array instead of throwing (table might not exist yet)
      if (response.status === 500) {
        console.warn(
          "Backend returned 500, returning empty array. Tasks table might not exist."
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
    console.error("Error fetching tasks:", error);
    // Return empty array instead of throwing, so UI doesn't break
    return [];
  }
};

/**
 * Get task by ID
 * @param {number} projectId - Project ID
 * @param {number} taskId - Task ID
 */
export const getTaskById = async (projectId, taskId) => {
  try {
    if (!projectId || !taskId) {
      throw new Error("projectId and taskId are required");
    }

    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`
    );
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
 * @param {number} projectId - Project ID
 * @param {object} taskData - Task data
 */
export const createTask = async (projectId, taskData) => {
  try {
    if (!projectId) {
      throw new Error("projectId is required");
    }

    const backendData = mapFrontendToBackend(taskData);
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/tasks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      }
    );
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
 * @param {number} projectId - Project ID
 * @param {number} taskId - Task ID
 * @param {object} taskData - Updated task data
 */
export const updateTask = async (projectId, taskId, taskData) => {
  try {
    if (!projectId || !taskId) {
      throw new Error("projectId and taskId are required");
    }

    const backendData = mapFrontendToBackend(taskData);
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      }
    );
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
 * @param {number} projectId - Project ID
 * @param {number} taskId - Task ID
 */
export const deleteTask = async (projectId, taskId) => {
  try {
    if (!projectId || !taskId) {
      throw new Error("projectId and taskId are required");
    }

    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`,
      {
        method: "DELETE",
      }
    );
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
