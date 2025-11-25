/**
 * Uses routes: /api/teams
 */

const API_BASE_URL = "http://localhost:3000/api";

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
      throw new Error("projectId is required");
    }

    const url = `${API_BASE_URL}/teams?projectId=${projectId}`;
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
      if (projectResponse.ok) {
        const project = await projectResponse.json();
        if (project && project.team_id) {
          // Get the team by team_id
          const teamResponse = await fetch(
            `${API_BASE_URL}/teams/${project.team_id}`
          );
          if (teamResponse.ok) {
            const team = await teamResponse.json();
            const frontendTeam = mapBackendToFrontend(team);
            frontendTeam.projectAssignments = [String(projectId)];
            return [frontendTeam];
          }
        }
      }
    } catch (projectError) {
      console.warn("Could not fetch project to get team_id:", projectError);
    }

    // Return empty array if no team found
    return [];
  } catch (error) {
    console.error("Error fetching teams by project:", error);
    return [];
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
      if (response.status === 500) {
        console.warn(
          "Backend returned 500, returning empty array. Teams table might not exist."
        );
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Error fetching all teams:", error);
    return [];
  }
};

/**
 * Get team by ID
 */
export const getTeamById = async (teamId) => {
  try {
    if (!teamId) {
      throw new Error("teamId is required");
    }

    const teamIdNum = typeof teamId === "string" ? parseInt(teamId) : teamId;
    const response = await fetch(`${API_BASE_URL}/teams/${teamIdNum}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error fetching team:", error);
    throw error;
  }
};

/**
 * Create a new team
 */
export const createTeam = async (teamData) => {
  try {
    console.log("createTeam called with teamData:", teamData);

    const { projectId, members, ...restData } = teamData;
    const backendData = mapFrontendToBackend(restData);
    console.log("Mapped backendData:", backendData);

    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
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
    console.error("Error creating team:", error);
    throw error;
  }
};

/**
 * Update a team
 */
export const updateTeam = async (teamId, teamData) => {
  try {
    console.log(
      "updateTeam called with teamId:",
      teamId,
      "teamData:",
      teamData
    );

    const teamIdNum = typeof teamId === "string" ? parseInt(teamId) : teamId;
    const { members, projectAssignments, ...restData } = teamData;
    const backendData = mapFrontendToBackend(restData);
    console.log("Mapped backendData:", backendData);

    const response = await fetch(`${API_BASE_URL}/teams/${teamIdNum}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
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
    console.error("Error updating team:", error);
    throw error;
  }
};

/**
 * Delete a team
 */
export const deleteTeam = async (teamId, projectId) => {
  try {
    if (!teamId) {
      throw new Error("teamId is required");
    }

    const teamIdNum = typeof teamId === "string" ? parseInt(teamId) : teamId;

    let url = `${API_BASE_URL}/teams/${teamIdNum}`;

    if (projectId) {
      const projectIdNum =
        typeof projectId === "string" ? parseInt(projectId) : projectId;
      url += `?projectId=${projectIdNum}`;
    }

    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
};
