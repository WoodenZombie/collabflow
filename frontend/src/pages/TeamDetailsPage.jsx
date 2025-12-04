import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TeamDetails from "../components/teamDetails/TeamDetails";
import TaskHeader from "../components/TaskHeader/TaskHeader";
import styles from "./tasksPage.module.css";
import { getTeamById, deleteTeam, updateTeam } from "../services/teamApi";
import { getAllTasks } from "../services/taskApi";
import TeamForm from "../components/forms/TeamForm";
import DeleteTeamForm from "../components/forms/DeleteTeamForm";
import { getAllUsers } from "../services/userApi";

function TeamDetailsPage() {
  const { projectId, teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDeleteTeamModalOpen, setIsDeleteTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);

  const loadTeam = useCallback(async () => {
    try {
      // Pass projectId to getTeamById because the backend route is nested: /api/projects/:projectId/teams/:teamId
      const t = await getTeamById(teamId, projectId);
      console.log("Loaded team:", t);
      setTeam(t);
    } catch (err) {
      console.error("Failed to load team:", err);
    }
  }, [teamId]);

  const loadTasks = useCallback(async () => {
    try {
      const pid = parseInt(projectId);
      const data = await getAllTasks(pid);
      const filtered = data.filter((t) => String(t.team_id) === String(teamId));
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

  useEffect(() => {
    loadTeam();
    loadTasks();
    loadUsers();
  }, [loadTeam, loadTasks, loadUsers]);

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
      navigate(`/tasks/${projectId}`);
    } catch (err) {
      console.error("Failed to delete team:", err);
      setIsDeleteTeamModalOpen(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <TaskHeader
        projectName={team ? (team.name || "Unnamed Team") : "Loading..."}
        onBack={() => navigate(`/tasks/${projectId}`)}
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
        onEditTeam={handleEditTeam}
        onDeleteTeam={confirmDeleteTeam}
        onRemoveMember={(teamId, userId) => {
          console.warn("Remove member not implemented", teamId, userId);
        }}
        onAddMemberByEmail={(teamId, email) => {
          console.warn("Add member by email not implemented", teamId, email);
        }}
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
    </div>
  );
}

export default TeamDetailsPage;
