import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TeamDetails from "../components/teamDetails/TeamDetails";
import TaskHeader from "../components/TaskHeader/TaskHeader";
import styles from "./tasksPage.module.css";
import { getTeamById, deleteTeam, updateTeam, addTeamMember, removeTeamMember } from "../services/teamApi";
import { getAllTasks } from "../services/taskApi";
import TeamForm from "../components/forms/TeamForm";
import DeleteTeamForm from "../components/forms/DeleteTeamForm";
import DeleteTeamMemberModal from "../components/forms/DeleteTeamMemberModal";
import { getAllUsers } from "../services/userApi";
import { useAuth } from "../context/AuthContext";
import { getProjectById, addProjectMember } from "../services/projectApi";

function TeamDetailsPage() {
  const { projectId, teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [project, setProject] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDeleteTeamModalOpen, setIsDeleteTeamModalOpen] = useState(false);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadTeam = useCallback(async () => {
    try {
      // Pass projectId to getTeamById because the backend route is nested: /api/projects/:projectId/teams/:teamId
      const t = await getTeamById(teamId, projectId);
      console.log("Loaded team:", t);
      console.log("Team members:", t?.members);
      setTeam(t);
    } catch (err) {
      console.error("Failed to load team:", err);
    }
  }, [teamId, projectId]);

  const loadTasks = useCallback(async () => {
    try {
      const pid = parseInt(projectId);
      const tid = parseInt(teamId);
      const data = await getAllTasks(pid);
      console.log("All tasks:", data);
      console.log("Filtering for teamId:", tid);
      // Filter tasks by team_id, handling both string and number comparisons
      const filtered = data.filter((t) => {
        const taskTeamId = t.team_id ? parseInt(t.team_id) : null;
        return taskTeamId === tid;
      });
      console.log("Filtered tasks for team:", filtered);
      setTasks(filtered);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setTasks([]);
    }
  }, [projectId, teamId]);

  const loadUsers = useCallback(async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }, []);

  const loadProject = useCallback(async () => {
    try {
      const pid = parseInt(projectId);
      const pr = await getProjectById(pid);
      setProject(pr);
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  }, [projectId]);

  // Check if current user is Project Manager
  const isProjectManager = () => {
    console.log('isProjectManager check:', { user, project, userRole: user?.role, projectCreator: project?.created_by });
    
    if (!user || !project) {
      console.log('isProjectManager: false - missing user or project');
      return false;
    }
    
    // Check if user role is Project Manager
    if (user.role === "Project Manager") {
      console.log('isProjectManager: true - user role is Project Manager');
      return true;
    }
    
    // Check if user is the creator of the project
    const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
    const projectCreatorId = typeof project.created_by === "string" 
      ? parseInt(project.created_by) 
      : project.created_by;
    
    const isCreator = userId === projectCreatorId;
    console.log('isProjectManager: checking creator:', { userId, projectCreatorId, isCreator });
    
    return isCreator;
  };

  useEffect(() => {
    loadTeam();
    loadTasks();
    loadUsers();
    loadProject();
  }, [loadTeam, loadTasks, loadUsers, loadProject]);

  const handleEditTeam = (t) => {
    setTeamToEdit(t);
    setIsTeamModalOpen(true);
  };

  const handleUpdateTeam = async (teamData) => {
    try {
      const updated = await updateTeam(team.id, { ...teamData, projectId });
      setTeam(updated);
      setIsTeamModalOpen(false);
      setTeamToEdit(null);
    } catch (err) {
      console.error("Failed to update team:", err);
    }
  };

  const handleDeleteTeam = async (id) => {
    setIsDeleteTeamModalOpen(true);
  };

  const confirmDeleteTeam = async (id) => {
    try {
      await deleteTeam(id || team.id, projectId);
      setIsDeleteTeamModalOpen(false);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error("Failed to delete team:", err);
      setIsDeleteTeamModalOpen(false);
    }
  };

  const handleRemoveMember = (teamId, userId) => {
    console.log('=== handleRemoveMember CALLED ===');
    console.log('handleRemoveMember called with:', { teamId, userId, team, isPM: isProjectManager() });
    console.log('Current state:', { 
      isDeleteMemberModalOpen, 
      memberToRemove,
      teamMembers: team?.members 
    });
    
    if (!isProjectManager()) {
      console.warn('handleRemoveMember: User is not Project Manager');
      setErrorMessage("Only Project Managers can remove users from teams.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    if (!team) {
      console.error('handleRemoveMember: Team is null');
      setErrorMessage("Team not found.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    // Find user info from team members
    const userToRemove = team?.members?.find(m => {
      const memberId = m.id || (typeof m === 'object' ? m.user_id : m);
      const matches = String(memberId) === String(userId);
      console.log('Checking member:', { memberId, userId, matches, member: m });
      return matches;
    });
    
    console.log('User to remove found:', userToRemove, 'from members:', team.members);
    
    if (userToRemove) {
      const memberId = userToRemove.id || userId;
      console.log('Setting memberToRemove and opening modal:', { memberId, userToRemove });
      setMemberToRemove({ id: memberId, ...userToRemove });
      setIsDeleteMemberModalOpen(true);
      console.log('Modal should now be open. isDeleteMemberModalOpen will be:', true);
    } else {
      console.error('User not found in team members:', { userId, members: team.members });
      setErrorMessage("User not found in team members.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !team) return;

    setIsRemovingMember(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await removeTeamMember(team.id, projectId, memberToRemove.id);
      setSuccessMessage(result.message || `User ${memberToRemove.email || memberToRemove.name} successfully removed from the team.`);
      
      // Refresh team data to show updated member list
      await loadTeam();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Failed to remove team member:", err);
      const errorMsg = err.message || "Failed to remove user from team. Please try again.";
      setErrorMessage(errorMsg);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    } finally {
      setIsRemovingMember(false);
      setIsDeleteMemberModalOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleAddMemberByEmail = async (teamId, email) => {
    // Check if user is Project Manager
    if (!isProjectManager()) {
      setErrorMessage("Only Project Managers can add users to teams.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    if (!email || !email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsAddingMember(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // First, add user to project (if not already a member)
      try {
        await addProjectMember(projectId, email);
        console.log(`User ${email} added to project ${projectId}`);
      } catch (projectErr) {
        // If user is already a project member, that's fine - continue
        if (projectErr.message && projectErr.message.includes("already")) {
          console.log(`User ${email} is already a project member`);
        } else {
          // If it's a different error, log it but continue - backend will handle validation
          console.warn(`Warning when adding user to project:`, projectErr.message);
        }
      }

      // Then, add user to team
      const result = await addTeamMember(teamId, projectId, email);
      setSuccessMessage(result.message || `User ${email} successfully added to the team.`);
      
      // Refresh team data to show new member
      await loadTeam();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Failed to add team member:", err);
      const errorMsg = err.message || "Failed to add user to team. Please try again.";
      setErrorMessage(errorMsg);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Success/Error Messages */}
      {successMessage && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{
              background: "none",
              border: "none",
              color: "#2e7d32",
              cursor: "pointer",
              fontSize: "18px",
              padding: "0 8px",
            }}
          >
            ×
          </button>
        </div>
      )}
      {errorMessage && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            style={{
              background: "none",
              border: "none",
              color: "#c62828",
              cursor: "pointer",
              fontSize: "18px",
              padding: "0 8px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <TaskHeader
        projectName={team ? (team.name || "Unnamed Team") : "Loading..."}
        onBack={() => navigate(`/projects/${projectId}`)}
        onCreateTask={null}
        onCreateAppointment={null}
        onCreateTeam={null}
        onEditProject={() => team && handleEditTeam(team)}
        onDeleteProject={() => team && handleDeleteTeam(team.id)}
      />

      {team && team.description && (
        <p style={{
          margin: '0 auto 16px',
          maxWidth: '960px',
          color: '#555',
          textAlign: 'left'
        }}>
          {team.description}
        </p>
      )}

      <TeamDetails
        team={team}
        tasks={tasks}
        onEditTeam={isProjectManager() ? handleEditTeam : undefined}
        onDeleteTeam={isProjectManager() ? confirmDeleteTeam : undefined}
        onRemoveMember={isProjectManager() ? handleRemoveMember : undefined}
        onAddMemberByEmail={isProjectManager() ? handleAddMemberByEmail : undefined}
        isAddingMember={isAddingMember}
        availableUsers={allUsers}
      />

      {isTeamModalOpen && teamToEdit && (
        <TeamForm
          teamToEdit={teamToEdit}
          allUsers={allUsers}
          onClose={() => setIsTeamModalOpen(false)}
          onSubmit={handleUpdateTeam}
        />
      )}

      {isDeleteTeamModalOpen && team && (
        <DeleteTeamForm
          team={team}
          allUsers={allUsers}
          onClose={() => setIsDeleteTeamModalOpen(false)}
          onDelete={confirmDeleteTeam}
        />
      )}

      {isDeleteMemberModalOpen && memberToRemove && team && (
        <DeleteTeamMemberModal
          user={memberToRemove}
          teamName={team.name}
          onClose={() => {
            console.log('DeleteTeamMemberModal onClose called');
            setIsDeleteMemberModalOpen(false);
            setMemberToRemove(null);
          }}
          onConfirm={() => {
            console.log('DeleteTeamMemberModal onConfirm called');
            confirmRemoveMember();
          }}
        />
      )}
    </div>
  );
}

export default TeamDetailsPage;