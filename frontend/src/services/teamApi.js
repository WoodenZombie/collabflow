/**
 * Uses routes: /api/teams
 */

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Custom error class for Team API errors
 */
export class TeamApiError extends Error {
  constructor(message, statusCode, originalError = null) {
    super(message);
    this.name = "TeamApiError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Parse error response from backend
 */
const parseErrorResponse = async (response) => {
  try {
    const errorData = await response.json();
    return {
      message: errorData.message || errorData.error || "An error occurred",
      errors: errorData.errors || null,
      statusCode: response.status,
    };
  } catch {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
      errors: null,
      statusCode: response.status,
    };
  }
};

/**
 * Handle network and fetch errors
 */
const handleFetchError = (error, operation) => {
  if (error instanceof TeamApiError) {
    return error;
  }

  // Network error (no internet, server down, etc.)
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return new TeamApiError(
      "Unable to connect to server. Please check your internet connection.",
      0,
      error
    );
  }

  // Other errors
  return new TeamApiError(`Failed to ${operation}: ${error.message}`, 0, error);
};

/**
 * Get user-friendly error message based on status code
 */
const getErrorMessage = (statusCode, operation, customMessage = null) => {
  if (customMessage) {
    return customMessage;
  }

  switch (statusCode) {
    case 400:
      return `Invalid request. Please check your input and try again.`;
    case 401:
      return `You are not authorized to ${operation}. Please log in.`;
    case 403:
      return `You don't have permission to ${operation}.`;
    case 404:
      return `Team not found. It may have been deleted.`;
    case 409:
      return `Team already exists or conflicts with existing data.`;
    case 422:
      return `Validation failed. Please check your input.`;
    case 500:
      return `Server error occurred. Please try again later.`;
    case 503:
      return `Service temporarily unavailable. Please try again later.`;
    default:
      return `Failed to ${operation}. Please try again.`;
  }
};

/**
 * Map backend team data to frontend format
 * Backend teams have: id, name, description, created_by, created_at
 * Frontend expects: id, name, description, members, projectAssignments, createdAt, createdBy
 */
const mapBackendToFrontend = (backendTeam) => {
  return {
    id: String(backendTeam.id),
    name: backendTeam.name || "",
    description: backendTeam.description || "",
    members: backendTeam.members || [],
    projectAssignments: backendTeam.projectAssignments || [],
    createdAt:
      backendTeam.created_at ||
      backendTeam.createdAt ||
      new Date().toISOString(),
    createdBy: String(backendTeam.created_by || backendTeam.createdBy || ""),
  };
};

/**
 * Map frontend team data to backend format
 * Frontend: name, description, members, projectAssignments, projectId
 * Backend: name, description, created_by
 */
const mapFrontendToBackend = (frontendTeam) => {
  const backendData = {
    name: frontendTeam.name || "",
    description: frontendTeam.description || "",
  };

  if (frontendTeam.createdBy) {
    backendData.created_by = parseInt(frontendTeam.createdBy);
  }

  return backendData;
};

/**
 * Get teams by project ID
 */
export const getTeamsByProject = async (projectId) => {
  try {
    if (!projectId) {
      throw new TeamApiError("Project ID is required", 400);
    }

  const url = `${API_BASE_URL}/projects/${projectId}/teams`;
  const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map(mapBackendToFrontend);
      }
    }

  // Fallback: Get project to find team_id, then get team
    try {
      const projectResponse = await fetch(
        `${API_BASE_URL}/projects/${projectId}`
      );

      if (!projectResponse.ok) {
        if (projectResponse.status === 404) {
          // Project not found - return empty array (no teams for non-existent project)
          return [];
        }
        const errorData = await parseErrorResponse(projectResponse);
        throw new TeamApiError(
          getErrorMessage(
            projectResponse.status,
            "fetch project",
            errorData.message
          ),
          projectResponse.status
        );
      }

      const project = await projectResponse.json();
      if (project && project.team_id) {
        // Get the team by team_id
        const teamResponse = await fetch(
          `${API_BASE_URL}/teams/${project.team_id}`
        );

        if (!teamResponse.ok) {
          if (teamResponse.status === 404) {
            // Team not found - return empty array
            return [];
          }
          const errorData = await parseErrorResponse(teamResponse);
          throw new TeamApiError(
            getErrorMessage(
              teamResponse.status,
              "fetch team",
              errorData.message
            ),
            teamResponse.status
          );
        }

        const team = await teamResponse.json();
        const frontendTeam = mapBackendToFrontend(team);
        frontendTeam.projectAssignments = [String(projectId)];
        return [frontendTeam];
      }

      // No team assigned to project
      return [];
    } catch (projectError) {
      if (projectError instanceof TeamApiError) {
        throw projectError;
      }
      console.warn("Could not fetch project to get team_id:", projectError);
      // Return empty array on fallback failure (non-critical)
      return [];
    }
  } catch (error) {
    if (error instanceof TeamApiError) {
      throw error;
    }
    console.error("Error fetching teams by project:", error);
    throw handleFetchError(error, "fetch teams for project");
  }
};

/**
 * Get all teams
 */
export const getAllTeams = async () => {
  try {
    const url = `${API_BASE_URL}/teams`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);

      // For 500 errors, return empty array instead of throwing (table might not exist)
      if (response.status === 500) {
        console.warn(
          "Backend returned 500, returning empty array. Teams table might not exist."
        );
        return [];
      }

      throw new TeamApiError(
        getErrorMessage(response.status, "fetch teams", errorData.message),
        response.status
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn(
        "Backend returned non-array data for teams, returning empty array"
      );
      return [];
    }

    return data.map(mapBackendToFrontend);
  } catch (error) {
    if (error instanceof TeamApiError) {
      throw error;
    }
    console.error("Error fetching all teams:", error);
    throw handleFetchError(error, "fetch all teams");
  }
};

/**
 * Get team by ID
 */
export const getTeamById = async (teamId, projectId) => {
  try {
    if (!teamId) {
      throw new TeamApiError("Team ID is required", 400);
    }
    
    // If projectId is provided, use the correct nested route
    if (projectId) {
        const teamIdNum = typeof teamId === "string" ? parseInt(teamId) : teamId;
        const projectIdNum = typeof projectId === "string" ? parseInt(projectId) : projectId;

        const response = await fetch(`${API_BASE_URL}/projects/${projectIdNum}/teams/${teamIdNum}`);

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            throw new TeamApiError(
                getErrorMessage(response.status, "fetch team", errorData.message),
                response.status
            );
        }

        const data = await response.json();
        return mapBackendToFrontend(data);
    }

    // Fallback or error if no projectId (since backend requires it for the route)
    throw new TeamApiError("Project ID is required to fetch a team", 400);

    const data = await response.json();
    return mapBackendToFrontend(data);
  } catch (error) {
    if (error instanceof TeamApiError) {
      throw error;
    }
    console.error("Error fetching team:", error);
    throw handleFetchError(error, "fetch team");
  }
};

/**
 * Create a new team
 */
export const createTeam = async (teamData) => {
  try {
    if (!teamData) {
      throw new TeamApiError("Team data is required", 400);
    }

    console.log("createTeam called with teamData:", teamData);

    const { projectId, members, ...restData } = teamData;
    const backendData = mapFrontendToBackend(restData);

    // Validate required fields
    if (!backendData.name || backendData.name.trim() === "") {
      throw new TeamApiError("Team name is required", 400);
    }

    console.log("Mapped backendData:", backendData);

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);

      // Handle validation errors (422 or 400 with errors array)
      if (
        response.status === 422 ||
        (response.status === 400 && errorData.errors)
      ) {
        const validationMessage = errorData.errors
          ? errorData.errors.map((e) => e.msg || e.message).join(", ")
          : errorData.message;
        throw new TeamApiError(
          `Validation failed: ${validationMessage}`,
          response.status,
          errorData.errors
        );
      }

      throw new TeamApiError(
        getErrorMessage(response.status, "create team", errorData.message),
        response.status
      );
    }

    const data = await response.json();
    console.log("createTeam response:", data);

    const frontendTeam = mapBackendToFrontend(data);

    if (projectId) {
      frontendTeam.projectAssignments = [String(projectId)];
    }

    if (members && Array.isArray(members)) {
      frontendTeam.members = members;
    }

    return frontendTeam;
  } catch (error) {
    if (error instanceof TeamApiError) {
      throw error;
    }
    console.error("Error creating team:", error);
    throw handleFetchError(error, "create team");
  }
};

/**
 * Update a team
 */
export const updateTeam = async (teamId, teamData) => {
  try {
    if (!teamId) {
      throw new TeamApiError("Team ID is required", 400);
    }

    if (!teamData) {
      throw new TeamApiError("Team data is required", 400);
    }

    console.log(
      "updateTeam called with teamId:",
      teamId,
      "teamData:",
      teamData
    );

    const teamIdNum = typeof teamId === "string" ? parseInt(teamId) : teamId;

    if (isNaN(teamIdNum)) {
      throw new TeamApiError("Invalid team ID format", 400);
    }

    const { members, projectAssignments, ...restData } = teamData;
    const backendData = mapFrontendToBackend(restData);

    // Validate required fields if name is being updated
    if (
      backendData.name !== undefined &&
      (!backendData.name || backendData.name.trim() === "")
    ) {
      throw new TeamApiError("Team name cannot be empty", 400);
    }

    console.log("Mapped backendData:", backendData);

    const projectId = teamData.projectId;
    const base = projectId ? `${API_BASE_URL}/projects/${projectId}/teams/${teamIdNum}` : `${API_BASE_URL}/teams/${teamIdNum}`;
    const response = await fetch(base, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);

      // Handle validation errors
      if (
        response.status === 422 ||
        (response.status === 400 && errorData.errors)
      ) {
        const validationMessage = errorData.errors
          ? errorData.errors.map((e) => e.msg || e.message).join(", ")
          : errorData.message;
        throw new TeamApiError(
          `Validation failed: ${validationMessage}`,
          response.status,
          errorData.errors
        );
      }

      throw new TeamApiError(
        getErrorMessage(response.status, "update team", errorData.message),
        response.status
      );
    }

    const data = await response.json();
    console.log("updateTeam response:", data);

    // Map response to frontend format
    const frontendTeam = mapBackendToFrontend(data);

    // Preserve members and projectAssignments if they exist in original data
    if (members && Array.isArray(members)) {
      frontendTeam.members = members;
    }
    if (projectAssignments && Array.isArray(projectAssignments)) {
      frontendTeam.projectAssignments = projectAssignments;
    }

    return frontendTeam;
  } catch (error) {
    if (error instanceof TeamApiError) {
      throw error;
    }
    console.error("Error updating team:", error);
    throw handleFetchError(error, "update team");
  }
};

/**
 * Delete a team
 */
export const deleteTeam = async (teamId, projectId) => {
  try {
    if (!teamId) {
      throw new TeamApiError("Team ID is required", 400);
    }

    const teamIdNum = typeof teamId === "string" ? parseInt(teamId) : teamId;

    if (isNaN(teamIdNum)) {
      throw new TeamApiError("Invalid team ID format", 400);
    }

    let url = `${API_BASE_URL}/teams/${teamIdNum}`;

    if (projectId) {
      const projectIdNum = typeof projectId === "string" ? parseInt(projectId) : projectId;
      if (isNaN(projectIdNum)) {
        throw new TeamApiError("Invalid project ID format", 400);
      }
      // Prefer nested route
      url = `${API_BASE_URL}/projects/${projectIdNum}/teams/${teamIdNum}`;
    }

    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);
      throw new TeamApiError(
        getErrorMessage(
          response.status,
          projectId ? "unassign team from project" : "delete team",
          errorData.message
        ),
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TeamApiError) {
      throw error;
    }
    console.error("Error deleting team:", error);
    throw handleFetchError(
      error,
      projectId ? "unassign team from project" : "delete team"
    );
  }
};
