let mockTeams = [
  {
    id: "101",
    name: "Frontend Team",
    description: "Responsible for UI implementation and React components.",
    members: ["1", "3", "5"],
    projectAssignments: ["1", "2"], 
    createdAt: "2025-01-10T09:00:00Z",
    createdBy: "1"
  },
  {
    id: "102",
    name: "Backend Team",
    description: "API development, Database management and Server logic.",
    members: ["2", "4"],
    projectAssignments: ["1"],
    createdAt: "2025-01-11T10:00:00Z",
    createdBy: "1"
  },
  {
    id: "103",
    name: "QA Team",
    description: "Testing and bug tracking for Project 2.",
    members: ["6", "7"],
    projectAssignments: ["2"],
    createdAt: "2025-01-12T10:00:00Z",
    createdBy: "2"
  }
];

export const getTeamsByProject = async (projectId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const projectTeams = mockTeams.filter(t => 
        t.projectAssignments && t.projectAssignments.includes(String(projectId))
      );
      resolve(projectTeams); 
    }, 500);
  });
};

export const createTeam = async (teamData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { projectId, ...restData } = teamData;
      
      const newTeam = {
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        createdBy: "1", // Hardcoded current user (mock)
        projectAssignments: projectId ? [String(projectId)] : [],
        ...restData
      };
      
      mockTeams = [...mockTeams, newTeam];
      resolve(newTeam);
    }, 500);
  });
};

export const updateTeam = async (id, updatedData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockTeams.findIndex(t => t.id === id);
      if (index !== -1) {
        mockTeams[index] = { ...mockTeams[index], ...updatedData };
        resolve(mockTeams[index]);
      }
    }, 500);
  });
};

export const deleteTeam = async (teamId, projectId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const teamIndex = mockTeams.findIndex(t => t.id === teamId);
      
      if (teamIndex !== -1) {
        const team = mockTeams[teamIndex];
        
        if (projectId && team.projectAssignments) {
            team.projectAssignments = team.projectAssignments.filter(id => id !== String(projectId));
            
            if (team.projectAssignments.length === 0) {
                mockTeams = mockTeams.filter(t => t.id !== teamId);
                console.log(`Team ${teamId} fully deleted (no assignments left)`);
            } else {
                console.log(`Team ${teamId} unassigned from project ${projectId}`);
            }
        } else {
            mockTeams = mockTeams.filter(t => t.id !== teamId);
        }
      }
      resolve({ success: true });
    }, 500);
  });
};