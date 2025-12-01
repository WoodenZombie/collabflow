/**
 * Appointment API Service
 * Handles all HTTP requests to the backend API for appointments
 */

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Map backend appointment data to frontend format
 * Backend appointments have: id, project_id, task_id, title, description, start_time, duration, location, created_by, created_at
 */
const mapBackendToFrontend = (backendAppointment) => {
  // Parse start_time to extract date and time
  const startTime = backendAppointment.start_time
    ? new Date(backendAppointment.start_time)
    : null;

  let date = "";
  let time = "";

  if (startTime && !isNaN(startTime.getTime())) {
    // Format date as YYYY-MM-DD
    date = startTime.toISOString().split("T")[0];
    // Format time as HH:mm
    const hours = String(startTime.getHours()).padStart(2, "0");
    const minutes = String(startTime.getMinutes()).padStart(2, "0");
    time = `${hours}:${minutes}`;
  }

  return {
    id: String(backendAppointment.id),
    projectId: backendAppointment.project_id,
    taskId: backendAppointment.task_id,
    title: backendAppointment.title || "",
    description: backendAppointment.description || "",
    date: date,
    time: time,
    duration: backendAppointment.duration || 60, // Default 60 minutes
    location: backendAppointment.location || "",
    startTime: backendAppointment.start_time,
    createdAt: backendAppointment.created_at,
  };
};

/**
 * Map frontend appointment data to backend format
 * Backend expects: title, description, duration, location, start_time (datetime string like "2025-02-13T14:30:00")
 * Frontend sends: title, description, date, time, duration, location, projectId
 */
const mapFrontendToBackend = (frontendAppointment) => {
  // Combine date and time into datetime string for backend
  let start_time = "";
  
  if (frontendAppointment.date) {
    if (frontendAppointment.time) {
      // Combine date and time: "2025-02-13" + "14:30" = "2025-02-13T14:30:00"
      start_time = `${frontendAppointment.date}T${frontendAppointment.time}:00`;
    } else {
      // If no time provided, default to 00:00:00
      start_time = `${frontendAppointment.date}T00:00:00`;
    }
  }

  const backendData = {
    title: frontendAppointment.title || "",
    description: frontendAppointment.description || "",
    duration: parseInt(frontendAppointment.duration) || 60,
    location: frontendAppointment.location || "",
    start_time: start_time,
  };

  // Add project_id if provided
  if (frontendAppointment.projectId) {
    backendData.project_id = parseInt(frontendAppointment.projectId);
  }

  return backendData;
};

/**
 * Get all appointments for a project
 * Backend endpoint: GET /api/appointments/:projectId
 * 
 * @param {number} projectId - Required project ID to fetch appointments for
 */
export const getAppointmentsByProject = async (projectId) => {
  if (!projectId) {
    throw new Error("Project ID is required to fetch appointments");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/appointments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch appointments: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    // Handle both array and single object responses
    const appointmentsArray = Array.isArray(data) ? data : (data ? [data] : []);
    return appointmentsArray.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

/**
 * Create a new appointment
 * @param {object} appointmentData - Appointment data with title, description, date, time, duration, location, projectId
 * Backend endpoint: POST /api/appointments
 * Backend expects: { title, description, duration, location, start_time, project_id }
 */
export const createAppointment = async (appointmentData) => {

  if (!appointmentData) {
    throw new Error("Appointment data is required");
  }

  if (!appointmentData.title || !appointmentData.description || !appointmentData.date || !appointmentData.location) {
    throw new Error("Title, description, date, and location are required to create an appointment");
  }

  if (!appointmentData.projectId) {
    throw new Error("Project ID is required to create an appointment");
  }

  const backendData = mapFrontendToBackend(appointmentData);

  console.log("Sending appointment data to backend:", backendData);

  try {
    // If backend expects projectId in URL, use this:
    const response = await fetch(`${API_BASE_URL}/projects/${appointmentData.projectId}/appointments`, {  // ${projectId}
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Failed to create appointment: ${response.status} ${response.statusText}`;
      console.error("Backend error response:", errorData);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Appointment created successfully:", data);
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

/**
 * Delete an appointment
 * @param {number|string} appointmentId - Appointment ID to delete
 * Backend endpoint: DELETE /api/appointments/:appointmentId
 */
export const deleteAppointment = async (appointmentId, projectId) => {
  if (!appointmentId) {
    throw new Error("Appointment ID is required to delete an appointment");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/appointments/${appointmentId}`, {  // ${projectId}
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete appointment: ${response.status} ${response.statusText}`
      );
    }

    // Some APIs return empty body on DELETE, handle both cases
    const data = await response.json().catch(() => ({ success: true }));
    return data;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
};
