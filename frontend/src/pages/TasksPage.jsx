import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/taskCard/TaskCard";
import FilterTabs from "../components/filterTabs/FilterTabs";
import TaskHeader from "../components/TaskHeader/TaskHeader";
import ProgressBar from "../components/progressBar/ProgressBar";
import DeleteTaskForm from "../components/forms/DeleteTaskForm";
import CreateTaskForm from "../components/createTask/CreateTask";
import EditTaskForm from "../components/forms/EditTaskForm";
import CreateAppointmentForm from "../components/createAppointment/CreateAppointment";
import AppointmentList from "../components/appointmentList/AppointmentList";
import AppointmentsCalendar from "../components/appointmentCalendar/AppointmentsCalendar";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskApi";
import {
  getAppointmentsByProject,
  createAppointment,
  deleteAppointment,
  updateAppointment,
} from "../services/appointmentApi";
import {
  getProjectById,
  updateProject as updateProjectApi,
  deleteProject as deleteProjectApi,
  addProjectMember,
} from "../services/projectApi";
import styles from "./tasksPage.module.css";

import TeamCard from "../components/teamCard/TeamCard";
import TeamForm from "../components/forms/TeamForm";
import TeamDetails from "../components/teamDetails/TeamDetails";
import {
  getTeamsByProject,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} from "../services/teamApi";
import { getAllUsers } from "../services/userApi";
import DeleteTeamForm from "../components/forms/DeleteTeamForm";
import DeleteTeamMemberModal from "../components/forms/DeleteTeamMemberModal";
import DeleteAppointmentModal from "../components/DeleteAppoinment/DeleteAppoinmentModal";
import EditAppointmentForm from "../components/forms/EditAppointmentForm";
import DeleteTaskModal from "../components/deleteTaskModule/deleteTaskModule";
import EditProjectForm from "../components/editProject/EditProject";
import DeleteProjectForm from "../components/deleteProject/DeleteProject";
// Using native HTML5 Drag and Drop instead of external library
import TaskDetailsModal from "../components/forms/TaskDetailsModal";

/**
 * TasksPage - Main page for displaying tasks grouped by status
 * Handles status cycling: Pending → In Progress → Completed → Pending
 * Can filter tasks by projectId if provided in URL
 */
function TasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateAppointmentModalOpen, setIsCreateAppointmentModalOpen] =
    useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isTaskActionsModalOpen, setIsTaskActionsModalOpen] = useState(false);
  const [taskForActions, setTaskForActions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeFilter, setActiveFilter] = useState("byTotalTasks");
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState(null);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  //TEAM state

  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [isDeleteTeamModalOpen, setIsDeleteTeamModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [teamToView, setTeamToView] = useState(null);
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
  const [isRemovingTeamMember, setIsRemovingTeamMember] = useState(false);
  const [teamMemberError, setTeamMemberError] = useState(null);
  const [teamMemberSuccess, setTeamMemberSuccess] = useState(null);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Add state for delete appointment modal
  const [isDeleteAppointmentModalOpen, setIsDeleteAppointmentModalOpen] =
    useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] =
    useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);

  // Add state for delete task modal
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  /**
   * Load all tasks from backend
   * Uses projectId for tasks API
   */
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!projectId) {
        console.warn("No projectId provided, cannot load tasks");
        setTasks([]);
        return;
      }
      const projectIdNum = parseInt(projectId);
      const data = await getAllTasks(projectIdNum);
      console.debug(
        "TasksPage: fetched tasks count",
        data.length,
        "for project",
        projectIdNum
      );
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  /**
   * Load appointments for the project
   */
  const loadAppointments = useCallback(async () => {
    if (!projectId) {
      setAppointments([]);
      return;
    }

    try {
      setIsLoadingAppointments(true);
      setError(null);
      const projectIdNum = parseInt(projectId);
      const data = await getAppointmentsByProject(projectIdNum);
      console.debug(
        "TasksPage: fetched appointments count",
        data.length,
        "for project",
        projectIdNum
      );
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      // Only set error if we're on appointments tab
      if (activeFilter === "appointments") {
        setError("Failed to load appointments. Please try again.");
      }
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [projectId, activeFilter]);

  // Check if createTask param is in URL and open modal
  useEffect(() => {
    if (searchParams.get("createTask") === "true") {
      setIsCreateModalOpen(true);
      // Remove the query parameter from URL
      searchParams.delete("createTask");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  /**
   * Load project name from API when projectId changes
   */
  const loadProjectName = useCallback(async () => {
    if (!projectId) {
      setProjectName("");
      setProject(null);
      return;
    }
    try {
      const projectIdNum = parseInt(projectId);
      const pr = await getProjectById(projectIdNum);
      setProject(pr);
      setProjectName(pr.name || pr.title || `Project ${projectId}`);
    } catch (err) {
      console.error("Failed to load project name:", err);
      setProjectName(`Project ${projectId}`); // Fallback to placeholder
    }
  }, [projectId]);

  /**
   * Load tasks, appointments and project name from API on component mount or when projectId changes
   */

  // Load teams for the project (used for filtering tasks and appointments)
  const loadProjectTeams = useCallback(async () => {
    if (!projectId) {
      setTeams([]);
      return;
    }
    try {
      const teamsData = await getTeamsByProject(projectId);
      setTeams(teamsData);
    } catch (err) {
      console.error("Error loading project teams:", err);
      setTeams([]);
    }
  }, [projectId]);

  useEffect(() => {
    loadTasks();
    loadProjectTeams();
    loadAppointments();
    loadProjectName();
  }, [loadTasks, loadAppointments, loadProjectName, loadProjectTeams]);

  /**
   * Filter tasks by teams where the current user is a member
   * Show tasks that either:
   * - Don't have a team_id (unassigned tasks)
   * - Have a team_id that belongs to a team where the user is a member
   */
  useEffect(() => {
    // If no teams loaded yet or no project or no user, show all tasks for the project
    if (!teams || teams.length === 0 || !projectId || !user) {
      console.debug("TasksPage: No teams/user, showing all tasks", tasks.length);
      setFilteredTasks(tasks);
      return;
    }
    
    // Get team IDs where the current user is a member
    const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
    const userTeamIds = teams
      .filter(team => {
        // Check if user is in team.members array
        if (team.members && Array.isArray(team.members)) {
          return team.members.some(member => {
            const memberId = typeof member.id === "string" ? parseInt(member.id) : member.id;
            return memberId === userId;
          });
        }
        return false;
      })
      .map(team => parseInt(team.id));
    
    console.debug("TasksPage: Filtering tasks. User teams:", userTeamIds, "Total tasks:", tasks.length, "User ID:", userId);
    
    // Filter tasks: show if task has no team_id OR if task belongs to a team where user is a member
    const filtered = tasks.filter(task => {
      const taskTeamId = task.team_id ? parseInt(task.team_id) : null;
      // Show task if it has no team_id (unassigned) or if it belongs to a team where user is a member
      const shouldShow = taskTeamId === null || userTeamIds.includes(taskTeamId);
      if (!shouldShow) {
        console.debug("TasksPage: Filtered out task", task.title, "team_id:", taskTeamId);
      }
      return shouldShow;
    });
    console.debug("TasksPage: Filtered tasks count:", filtered.length, "out of", tasks.length);
    setFilteredTasks(filtered);
  }, [tasks, teams, projectId, user]);

  /**
   * Filter appointments - show appointments where:
   * - User is in participants array, OR
   * - Appointment has team_id and user is a member of that team, OR
   * - Appointment has no team_id (backward compatibility)
   */
  useEffect(() => {
    // If no user or no teams loaded yet, show all appointments
    if (!user || !teams || teams.length === 0) {
      setFilteredAppointments(appointments);
      return;
    }
    
    const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
    
    // Get team IDs where the current user is a member
    const userTeamIds = teams
      .filter(team => {
        if (team.members && Array.isArray(team.members)) {
          return team.members.some(member => {
            const memberId = typeof member.id === "string" ? parseInt(member.id) : member.id;
            return memberId === userId;
          });
        }
        return false;
      })
      .map(team => parseInt(team.id));
    
    // Filter appointments
    const filtered = appointments.filter(appointment => {
      // Check if user is in participants array
      if (appointment.participants && Array.isArray(appointment.participants)) {
        const isParticipant = appointment.participants.some(participantId => {
          const pId = typeof participantId === "string" ? parseInt(participantId) : participantId;
          return pId === userId;
        });
        if (isParticipant) {
          console.debug("TasksPage: Appointment", appointment.title, "shown - user is participant");
          return true;
        }
      }
      
      // Check if appointment has team_id and user is a member of that team
      if (appointment.team_id) {
        const appointmentTeamId = typeof appointment.team_id === "string" 
          ? parseInt(appointment.team_id) 
          : appointment.team_id;
        if (userTeamIds.includes(appointmentTeamId)) {
          console.debug("TasksPage: Appointment", appointment.title, "shown - user is member of team", appointmentTeamId);
          return true;
        } else {
          console.debug("TasksPage: Appointment", appointment.title, "filtered out - team_id:", appointmentTeamId, "user teams:", userTeamIds);
        }
      } else {
        // If no team_id, show the appointment (backward compatibility)
        console.debug("TasksPage: Appointment", appointment.title, "shown - no team_id (backward compatibility)");
        return true;
      }
      
      return false;
    });
    
    console.debug("TasksPage: Filtered appointments count:", filtered.length, "out of", appointments.length, "User ID:", userId, "User teams:", userTeamIds);
    console.debug("TasksPage: All appointments data:", appointments.map(a => ({ title: a.title, team_id: a.team_id, participants: a.participants })));
    setFilteredAppointments(filtered);
  }, [appointments, teams, projectId, user]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /**
   * Cycle through status: Pending → In-Progress → Complete → Pending
   */
  const cycleStatus = (currentStatus) => {
    const statusCycle = {
      pending: "inProgress",
      inProgress: "completed",
      completed: "pending",
    };
    return statusCycle[currentStatus] || "pending";
  };

  /**
   * Handle status change when clicking on TaskCard
   */
  const handleStatusChange = async (taskId) => {
    const task = filteredTasks.find((t) => t.id === taskId);
    if (!task || !projectId) return;

    const newStatus = cycleStatus(task.status);
    const updatedTask = { ...task, status: newStatus };

    try {
      // Update task on backend
      const projectIdNum = parseInt(projectId);
      const taskIdNum = parseInt(taskId);
      const savedTask = await updateTask(projectIdNum, taskIdNum, updatedTask);
      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? savedTask : t))
      );
      // Update filtered tasks
      setFilteredTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? savedTask : t))
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError("Failed to update task status. Please try again.");
    }
  };

  /**
   * Handle opening delete modal
   */
  const handleOpenDeleteModal = () => {
    // Find the first completed task to show in modal
    const firstCompletedTask = filteredTasks.find(
      (t) => t.status === "completed"
    );
    if (firstCompletedTask) {
      setSelectedTask(firstCompletedTask);
      setIsDeleteModalOpen(true);
    }
  };

  /**
   * Handle closing delete modal
   */
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedTask(null);
  };

  /**
   * Handle task deletion with confirmation modal
   */
  const handleDeleteTaskClick = async (taskId) => {
    // Find the task to show in modal
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setIsDeleteTaskModalOpen(true);
      setIsTaskActionsModalOpen(false);
      setTaskForActions(null);
    }
  };

  /**
   * Confirm and execute task deletion
   */
  const confirmDeleteTask = async (taskId) => {
    if (!projectId) {
      setError("Cannot delete task: No project selected.");
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
      return;
    }

    try {
      const projectIdNum = parseInt(projectId);
      const taskIdNum = parseInt(taskId);
      await deleteTask(projectIdNum, taskIdNum);

      // Remove from local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      // Remove from filtered tasks
      setFilteredTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );

      // Show success message
      setSuccessMessage("Task deleted successfully!");
      // Clear any previous errors
      setError(null);

      // Close modal
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Failed to delete task. Please try again.");
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
    }
  };

  // /**
  //  * Handle opening create modal
  //  */
  // const handleOpenCreateModal = () => {
  //   setIsCreateModalOpen(true);
  // };

  /**
   * Handle closing create modal
   */
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  /**
   * Handle task creation
   */
  const handleCreateTask = async (newTask) => {
    try {
      if (!projectId) {
        setError("Cannot create task: No project selected.");
        return;
      }

      const projectIdNum = parseInt(projectId);

      // Determine team_id: use first team from newTask.teams (selected in form)
      // Only use fallback if no team was selected in the form
      let teamId = null;
      if (newTask.teams && newTask.teams.length > 0 && newTask.teams[0] && newTask.teams[0].id) {
        // Use team selected in form - this is the primary source
        teamId = parseInt(newTask.teams[0].id);
        console.debug("TasksPage: Using team from form:", teamId, "Team name:", newTask.teams[0].name);
      } else if (project?.team_id) {
        // Fallback to project's team_id only if no team was selected
        teamId = parseInt(project.team_id);
        console.debug("TasksPage: Using project team_id as fallback:", teamId);
      } else if (teams && teams.length > 0) {
        // Last fallback: first team from teams list
        teamId = parseInt(teams[0].id);
        console.debug("TasksPage: Using first team from teams list as fallback:", teamId);
      }

      // Add team_id to task data only if we have a valid team_id
      const taskData = {
        ...newTask,
        ...(teamId && { team_id: teamId }),
      };
      
      console.debug("TasksPage: Creating task with team_id:", teamId, "Task data:", taskData);

      // Create task on backend
      const savedTask = await createTask(projectIdNum, taskData);
      // Add to local state
      setTasks((prevTasks) => [...prevTasks, savedTask]);
      // Add to filtered tasks (should always match since we're creating for this project)
      setFilteredTasks((prevTasks) => [...prevTasks, savedTask]);
      // Close modal
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Failed to create task. Please try again.");
    }
  };

  /**
   * Handle opening edit modal
   */
  const handleOpenEditModal = (taskId) => {
    const task = filteredTasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToEdit(task);
      setIsEditModalOpen(true);
      setIsTaskActionsModalOpen(false);
      // Keep the selected task so we can reopen details on cancel
      setTaskForActions(task);
    }
  };

  /**
   * Handle closing edit modal
   */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTaskToEdit(null);
  };

  /**
   * Handle task update
   */
  const handleUpdateTask = async (updatedTask) => {
    try {
      if (!projectId) {
        setError("Cannot update task: No project selected.");
        return;
      }

      const projectIdNum = parseInt(projectId);
      const taskIdNum = parseInt(updatedTask.id);
      // Update task on backend
      const savedTask = await updateTask(projectIdNum, taskIdNum, updatedTask);
      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === savedTask.id ? savedTask : task))
      );
      // Update filtered tasks
      setFilteredTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === savedTask.id ? savedTask : task))
      );
      // Close modal
      setIsEditModalOpen(false);
      setTaskToEdit(null);
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  /**
   * Handle opening create appointment modal
   */
  const handleOpenCreateAppointmentModal = () => {
    setIsCreateAppointmentModalOpen(true);
  };

  /**
   * Handle closing create appointment modal
   */
  const handleCloseCreateAppointmentModal = () => {
    setIsCreateAppointmentModalOpen(false);
  };

  /**
   * Handle appointment creation
   */
  const handleCreateAppointment = async (newAppointment) => {
    try {
      if (!projectId) {
        setError("Cannot create appointment: No project selected.");
        return;
      }

      // Create appointment on backend
      const savedAppointment = await createAppointment(newAppointment);

      // Refresh appointments list to get the latest data
      await loadAppointments();

      // Show success message
      setSuccessMessage("Appointment created successfully!");
      // Close modal
      setIsCreateAppointmentModalOpen(false);
      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error("Failed to create appointment:", err);
      setError("Failed to create appointment. Please try again.");
      throw err; // Re-throw so CreateAppointmentForm can handle it
    }
  };

  /**
   * Handle appointment deletion with confirmation modal
   */
  const handleDeleteAppointment = async (appointmentId) => {
    // Find the appointment to show in modal
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      setAppointmentToDelete(appointment);
      setIsDeleteAppointmentModalOpen(true);
    }
  };

  const handleOpenEditAppointment = (appointment) => {
    setAppointmentToEdit(appointment);
    setIsEditAppointmentModalOpen(true);
    setIsDeleteAppointmentModalOpen(false);
    setAppointmentToDelete(null);
  };

  /**
   * Confirm and execute appointment deletion
   */
  const confirmDeleteAppointment = async (appointmentId) => {
    if (!projectId) {
      setError("Cannot delete appointment: No project selected.");
      setIsDeleteAppointmentModalOpen(false);
      setAppointmentToDelete(null);
      return;
    }

    try {
      const projectIdNum = parseInt(projectId);
      await deleteAppointment(appointmentId, projectIdNum);

      // Refresh appointments list to get the latest data
      await loadAppointments();

      // Show success message
      setSuccessMessage("Appointment deleted successfully!");
      // Clear any previous errors
      setError(null);

      // Close modal
      setIsDeleteAppointmentModalOpen(false);
      setAppointmentToDelete(null);
    } catch (err) {
      console.error("Failed to delete appointment:", err);
      setError("Failed to delete appointment. Please try again.");
      setIsDeleteAppointmentModalOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const handleUpdateAppointment = async (updatedAppointment) => {
    if (!projectId) {
      setError("Cannot update appointment: No project selected.");
      setIsEditAppointmentModalOpen(false);
      setAppointmentToEdit(null);
      return;
    }
    try {
      const projectIdNum = parseInt(projectId);
      const saved = await updateAppointment(
        updatedAppointment.id,
        projectIdNum,
        updatedAppointment
      );
      await loadAppointments();
      setSuccessMessage("Appointment updated successfully!");
      setIsEditAppointmentModalOpen(false);
      setAppointmentToEdit(null);
    } catch (err) {
      console.error("Failed to update appointment:", err);
      setError("Failed to update appointment. Please try again.");
    }
  };

  /**
   * Group tasks by status
   */
  const getTasksByStatus = () => {
    console.debug("TasksPage: Grouping tasks by status. Filtered tasks:", filteredTasks.length);
    console.debug("TasksPage: Sample task statuses:", filteredTasks.slice(0, 3).map(t => ({ title: t.title, status: t.status })));
    
    const inProgressTasks = filteredTasks.filter(
      (t) => t.status === "inProgress"
    );
    const pendingTasks = filteredTasks.filter((t) => t.status === "pending");
    const completedTasks = filteredTasks.filter(
      (t) => t.status === "completed"
    );

    console.debug("TasksPage: Grouped - Pending:", pendingTasks.length, "In Progress:", inProgressTasks.length, "Completed:", completedTasks.length);

    return {
      inProgress: inProgressTasks,
      pending: pendingTasks,
      completed: completedTasks,
    };
  };

  const tasksByStatus = getTasksByStatus();

  // Calculate total counts for progress bars
  const totalPending = tasksByStatus.pending.length;
  const totalInProgress = tasksByStatus.inProgress.length;
  const totalDone = tasksByStatus.completed.length;

  // Check if there is at least one completed task
  const hasCompleted = filteredTasks.some((t) => t.status === "completed");

  // TEAM logic

  // Load teams for the project (used for Create Task and Teams tab)

  const loadTeamsData = useCallback(async () => {
    if (activeFilter === "teams") {
      setIsLoading(true);
      try {
        const [teamsData, usersData] = await Promise.all([
          getTeamsByProject(projectId),
          getAllUsers(),
        ]);
        setTeams(teamsData);
        setAllUsers(usersData);
      } catch (err) {
        console.error("Error loading teams:", err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [activeFilter, projectId]);

  useEffect(() => {
    loadTeamsData();
  }, [loadTeamsData]);

  // Load project teams when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      loadProjectTeams();
    }
  }, [loadProjectTeams, projectId]);

  const handleCreateTeam = async (teamData) => {
    const newTeam = await createTeam({ ...teamData, projectId });
    setTeams((prev) => [...prev, newTeam]);
    // Note: Backend projects table doesn't have team_id column,
    // so we don't try to link team to project via project update
    // Teams are linked to projects through project_memberships or other relationships
    setIsTeamModalOpen(false);
  };

  const handleUpdateTeam = async (teamData) => {
    const updated = await updateTeam(teamToEdit.id, teamData);
    setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setIsTeamModalOpen(false);
    setTeamToEdit(null);
  };

  const handleHeaderAddClick = () => {
    if (activeFilter === "teams") {
      setTeamToEdit(null);
      setIsTeamModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateTeamClick = () => {
    setTeamToEdit(null);
    setIsTeamModalOpen(true);
  };

  // Check if current user is Project Manager
  const isProjectManager = () => {
    if (!user || !project) return false;
    
    // Check if user role is Project Manager
    if (user.role === "Project Manager") {
      return true;
    }
    
    // Check if user is the creator of the project
    const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
    const projectCreatorId = typeof project.created_by === "string" 
      ? parseInt(project.created_by) 
      : project.created_by;
    
    return userId === projectCreatorId;
  };

  // Handle adding user to team
  const handleAddTeamMember = async (teamId, email) => {
    if (!isProjectManager()) {
      setTeamMemberError("Only Project Managers can add users to teams.");
      setTimeout(() => setTeamMemberError(null), 5000);
      return;
    }

    if (!email || !email.trim()) {
      setTeamMemberError("Please enter a valid email address.");
      return;
    }

    setIsAddingTeamMember(true);
    setTeamMemberError(null);
    setTeamMemberSuccess(null);

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
      setTeamMemberSuccess(result.message || `User ${email} successfully added to the team.`);
      
      // Refresh teams data to show new member
      await loadProjectTeams();
      if (activeFilter === "teams") {
        await loadTeamsData();
      }
      
      // If viewing team details, refresh that team
      if (teamToView && String(teamToView.id) === String(teamId)) {
        const updatedTeams = await getTeamsByProject(projectId);
        const updatedTeam = updatedTeams.find(t => String(t.id) === String(teamId));
        if (updatedTeam) {
          setTeamToView(updatedTeam);
        }
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setTeamMemberSuccess(null);
      }, 5000);
    } catch (err) {
      console.error("Failed to add team member:", err);
      const errorMsg = err.message || "Failed to add user to team. Please try again.";
      setTeamMemberError(errorMsg);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setTeamMemberError(null);
      }, 5000);
    } finally {
      setIsAddingTeamMember(false);
    }
  };

  // Handle removing user from team
  const handleRemoveTeamMember = (teamId, userId) => {
    console.log('handleRemoveTeamMember called:', { teamId, userId, teamToView, teams });
    
    if (!isProjectManager()) {
      setTeamMemberError("Only Project Managers can remove users from teams.");
      setTimeout(() => setTeamMemberError(null), 5000);
      return;
    }

    // Find user info from team members
    const team = teamToView || teams.find(t => String(t.id) === String(teamId));
    console.log('Found team:', team);
    console.log('Team members:', team?.members);
    
    if (!team) {
      console.error('Team not found for teamId:', teamId);
      setTeamMemberError("Team not found.");
      setTimeout(() => setTeamMemberError(null), 5000);
      return;
    }

    const userToRemove = team?.members?.find(m => {
      const memberId = m.id || (typeof m === 'object' ? m.user_id : m);
      return String(memberId) === String(userId);
    });
    
    console.log('User to remove:', userToRemove);
    
    if (userToRemove) {
      const memberId = userToRemove.id || userId;
      setMemberToRemove({ id: memberId, teamId, ...userToRemove });
      setIsDeleteMemberModalOpen(true);
    } else {
      console.error('User not found in team members:', { userId, members: team.members });
      setTeamMemberError("User not found in team members.");
      setTimeout(() => setTeamMemberError(null), 5000);
    }
  };

  const confirmRemoveTeamMember = async () => {
    if (!memberToRemove) return;

    setIsRemovingTeamMember(true);
    setTeamMemberError(null);
    setTeamMemberSuccess(null);

    try {
      const result = await removeTeamMember(memberToRemove.teamId, projectId, memberToRemove.id);
      setTeamMemberSuccess(result.message || `User ${memberToRemove.email || memberToRemove.name} successfully removed from the team.`);
      
      // Refresh teams data to show updated member list
      await loadProjectTeams();
      if (activeFilter === "teams") {
        await loadTeamsData();
      }
      
      // If viewing team details, refresh that team
      if (teamToView && String(teamToView.id) === String(memberToRemove.teamId)) {
        const updatedTeams = await getTeamsByProject(projectId);
        const updatedTeam = updatedTeams.find(t => String(t.id) === String(memberToRemove.teamId));
        if (updatedTeam) {
          setTeamToView(updatedTeam);
        }
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setTeamMemberSuccess(null);
      }, 5000);
    } catch (err) {
      console.error("Failed to remove team member:", err);
      const errorMsg = err.message || "Failed to remove user from team. Please try again.";
      setTeamMemberError(errorMsg);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setTeamMemberError(null);
      }, 5000);
    } finally {
      setIsRemovingTeamMember(false);
      setIsDeleteMemberModalOpen(false);
      setMemberToRemove(null);
    }
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDropToStatus = async (status) => {
    if (!draggedTaskId) return;
    const taskId = draggedTaskId;
    const task = filteredTasks.find((t) => t.id === taskId);
    if (!task || task.status === status) {
      setDraggedTaskId(null);
      return;
    }
    const updatedTask = { ...task, status };
    try {
      const projectIdNum = parseInt(projectId);
      const savedTask = await updateTask(projectIdNum, taskId, updatedTask);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? savedTask : t)));
      setFilteredTasks((prev) =>
        prev.map((t) => (t.id === taskId ? savedTask : t))
      );
    } catch (err) {
      console.error("Failed to move task:", err);
      setError("Failed to move task. Please try again.");
    } finally {
      setDraggedTaskId(null);
    }
  };

  // Open actions modal when clicking a task card
  const openTaskActions = (task) => {
    setTaskForActions(task);
    setIsTaskActionsModalOpen(true);
  };

  // Project edit/delete handlers
  const openEditProject = () => setIsEditProjectOpen(true);
  const closeEditProject = () => setIsEditProjectOpen(false);
  const openDeleteProject = () => setIsDeleteProjectOpen(true);
  const closeDeleteProject = () => setIsDeleteProjectOpen(false);

  const handleUpdateProject = async (updatedProject) => {
    try {
      const saved = await updateProjectApi(projectId, updatedProject);
      setProject(saved);
      setProjectName(saved.name || saved.title || projectName);
      setSuccessMessage("Project updated successfully!");
      closeEditProject();
    } catch (err) {
      console.error("Failed to update project:", err);
      setError("Failed to update project. Please try again.");
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProjectApi(id);
      setSuccessMessage("Project deleted successfully!");
      closeDeleteProject();
      navigate("/");
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError("Failed to delete project. Please try again.");
    }
  };

  const handleDeleteTeamClick = (team) => {
    setTeamToDelete(team);
    setIsDeleteTeamModalOpen(true);
  };

  const openTeamDetails = (team) => {
    if (projectId && team?.id) {
      navigate(`/projects/${projectId}/teams/${team.id}`);
      return;
    }
    // Fallback: inline view if routing info missing
    setTeamToView(team);
  };

  const closeTeamDetails = () => {
    setTeamToView(null);
  };

  const confirmDeleteTeam = async (id) => {
    try {
      await deleteTeam(id, projectId);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      setIsDeleteTeamModalOpen(false);
      setTeamToDelete(null);
    } catch (err) {
      console.error("Failed to delete team", err);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Show error state
  if (error && filteredTasks.length === 0 && !isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={loadTasks}>Retry</button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            textAlign: "center",
          }}
        >
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: "10px" }}>
            ×
          </button>
        </div>
      )}
      {successMessage && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            textAlign: "center",
          }}
        >
          {successMessage}
          <button
            onClick={() => setSuccessMessage(null)}
            style={{ marginLeft: "10px" }}
          >
            ×
          </button>
        </div>
      )}
      <div
        className={styles.pageContainer}
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <TaskHeader
          projectName={projectName}
          onBack={projectId ? () => navigate("/") : null}
          onCreateTask={handleHeaderAddClick}
          onCreateAppointment={handleOpenCreateAppointmentModal}
          onCreateTeam={handleCreateTeamClick}
          onEditProject={openEditProject}
          onDeleteProject={openDeleteProject}
        />

        <FilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Appointments Section - Only show when Appointments tab is active */}
        {activeFilter === "appointments" && (
          <div style={{ marginBottom: "30px" }}>
            <AppointmentsCalendar
              appointments={filteredAppointments}
              onDelete={handleDeleteAppointment}
              isLoading={isLoadingAppointments}
            />
          </div>
        )}

        {/* Tasks Section - Only show when By Total Tasks tab is active */}
        {activeFilter === "byTotalTasks" && (
          <main className={styles.main}>
            {/* Pending Section (static) */}
            <section
              className={styles.section}
              onDragOver={allowDrop}
              onDrop={() => handleDropToStatus("pending")}
            >
              <ProgressBar
                count={totalPending}
                label="Pending"
                color="yellow"
              />
              {tasksByStatus.pending.length === 0 && (
                <p style={{ color: "#777", fontStyle: "italic" }}>No tasks</p>
              )}
              {tasksByStatus.pending.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  style={{ cursor: "grab" }}
                >
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    priorityLabel={task.priority}
                    status={task.status}
                    taskCount={task.taskCount}
                    responsiblePerson={
                      task.responsiblePerson ||
                      task.assigned_to ||
                      task.assignee ||
                      (task.user && task.user.name)
                    }
                    endDate={
                      task.endDate ||
                      task.due_date ||
                      task.deadline ||
                      task.endingDate
                    }
                    onClick={() => openTaskActions(task)}
                  />
                </div>
              ))}
            </section>

            {/* In Progress Section (static) */}
            <section
              className={styles.section}
              onDragOver={allowDrop}
              onDrop={() => handleDropToStatus("inProgress")}
            >
              <ProgressBar
                count={totalInProgress}
                label="In Progress"
                color="purple"
              />
              {tasksByStatus.inProgress.length === 0 && (
                <p style={{ color: "#777", fontStyle: "italic" }}>No tasks</p>
              )}
              {tasksByStatus.inProgress.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  style={{ cursor: "grab" }}
                >
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    priorityLabel={task.priority}
                    status={task.status}
                    taskCount={task.taskCount}
                    responsiblePerson={
                      task.responsiblePerson ||
                      task.assigned_to ||
                      task.assignee ||
                      (task.user && task.user.name)
                    }
                    endDate={
                      task.endDate ||
                      task.due_date ||
                      task.deadline ||
                      task.endingDate
                    }
                    onClick={() => openTaskActions(task)}
                  />
                </div>
              ))}
            </section>

            {/* Completed Section (static) */}
            <section
              className={styles.section}
              onDragOver={allowDrop}
              onDrop={() => handleDropToStatus("completed")}
            >
              <ProgressBar count={totalDone} label="Completed" color="green" />
              {tasksByStatus.completed.length === 0 && (
                <p style={{ color: "#777", fontStyle: "italic" }}>No tasks</p>
              )}
              {tasksByStatus.completed.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  style={{ cursor: "grab" }}
                >
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    priorityLabel={task.priority}
                    status={task.status}
                    taskCount={task.taskCount}
                    responsiblePerson={
                      task.responsiblePerson ||
                      task.assigned_to ||
                      task.assignee ||
                      (task.user && task.user.name)
                    }
                    endDate={
                      task.endDate ||
                      task.due_date ||
                      task.deadline ||
                      task.endingDate
                    }
                    onClick={() => openTaskActions(task)}
                  />
                </div>
              ))}
            </section>
          </main>
        )}

        {/* Teams Section - Only show when Teams tab is active */}
        {activeFilter === "teams" && (
          <div className={styles.teamsGrid}>
            {/* Success/Error Messages */}
            {teamMemberSuccess && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#e8f5e9",
                  color: "#2e7d32",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{teamMemberSuccess}</span>
                <button
                  onClick={() => setTeamMemberSuccess(null)}
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
            {teamMemberError && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#ffebee",
                  color: "#c62828",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{teamMemberError}</span>
                <button
                  onClick={() => setTeamMemberError(null)}
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

            {teamToView ? (
              <TeamDetails
                team={teamToView}
                tasks={filteredTasks.filter((t) => t.team_id === teamToView.id)}
                onEditTeam={(t) => {
                  if (isProjectManager()) {
                    setTeamToEdit(t);
                    setIsTeamModalOpen(true);
                  }
                }}
                onDeleteTeam={(id) => {
                  if (isProjectManager()) {
                    handleDeleteTeamClick({ id });
                  }
                }}
                onRemoveMember={isProjectManager() ? handleRemoveTeamMember : undefined}
                onAddMemberByEmail={isProjectManager() ? handleAddTeamMember : undefined}
                isAddingMember={isAddingTeamMember}
                availableUsers={allUsers}
              />
            ) : (
              <>
                {teams.length === 0 && !isLoading ? (
                  <p>No teams found for this project.</p>
                ) : (
                  teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      allUsers={allUsers}
                      onOpenDetails={openTeamDetails}
                      isProjectManager={isProjectManager()}
                      onAddUsers={(teamId) => {
                        // Navigate to team details page where users can be added
                        navigate(`/projects/${projectId}/teams/${teamId}`);
                      }}
                    />
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Delete button removed */}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskForm
          onClose={handleCloseCreateModal}
          onCreate={handleCreateTask}
          availableTeams={teams}
        />
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && taskToEdit && (
        <EditTaskForm
          task={taskToEdit}
          availableTeams={teams}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateTask}
          onCancel={() => {
            setIsEditModalOpen(false);
            // Reopen details modal for the same task
            setTaskForActions(taskToEdit);
            setIsTaskActionsModalOpen(true);
          }}
        />
      )}

      {/* Delete Task Modal */}
      {isDeleteTaskModalOpen && taskToDelete && (
        <DeleteTaskModal
          task={taskToDelete}
          onClose={() => {
            setIsDeleteTaskModalOpen(false);
            setTaskToDelete(null);
          }}
          onDelete={confirmDeleteTask}
        />
      )}

      {/* Create Appointment Modal */}
      {isCreateAppointmentModalOpen && (
        <CreateAppointmentForm
          onClose={handleCloseCreateAppointmentModal}
          onCreate={handleCreateAppointment}
          projectId={projectId}
          availableTeams={teams}
        />
      )}

      {/* Team Modal */}
      {isTeamModalOpen && (
        <TeamForm
          teamToEdit={teamToEdit}
          allUsers={allUsers}
          onClose={() => setIsTeamModalOpen(false)}
          onSubmit={teamToEdit ? handleUpdateTeam : handleCreateTeam}
        />
      )}

      {/* Edit Project Modal */}
      {isEditProjectOpen && project && (
        <EditProjectForm
          project={project}
          onClose={closeEditProject}
          onUpdate={handleUpdateProject}
        />
      )}

      {/* Delete Project Modal */}
      {isDeleteProjectOpen && project && (
        <DeleteProjectForm
          project={project}
          onClose={closeDeleteProject}
          onDelete={handleDeleteProject}
        />
      )}

      {/* Delete Team Modal */}
      {isDeleteTeamModalOpen && teamToDelete && (
        <DeleteTeamForm
          team={teamToDelete}
          allUsers={allUsers}
          onClose={() => setIsDeleteTeamModalOpen(false)}
          onDelete={confirmDeleteTeam}
        />
      )}

      {/* Delete Team Member Modal */}
      {isDeleteMemberModalOpen && memberToRemove && (
        <DeleteTeamMemberModal
          user={memberToRemove}
          teamName={teamToView?.name || teams.find(t => String(t.id) === String(memberToRemove.teamId))?.name || "team"}
          onClose={() => {
            setIsDeleteMemberModalOpen(false);
            setMemberToRemove(null);
          }}
          onConfirm={confirmRemoveTeamMember}
        />
      )}

      {/* Delete Appointment Modal */}
      {isDeleteAppointmentModalOpen && appointmentToDelete && (
        <DeleteAppointmentModal
          appointment={appointmentToDelete}
          onClose={() => {
            setIsDeleteAppointmentModalOpen(false);
            setAppointmentToDelete(null);
          }}
          onDelete={confirmDeleteAppointment}
          onEdit={handleOpenEditAppointment}
        />
      )}

      {/* Edit Appointment Modal */}
      {isEditAppointmentModalOpen && appointmentToEdit && (
        <EditAppointmentForm
          appointment={appointmentToEdit}
          onClose={() => {
            setIsEditAppointmentModalOpen(false);
            setAppointmentToEdit(null);
          }}
          onUpdate={handleUpdateAppointment}
          onCancel={(appt) => {
            setIsEditAppointmentModalOpen(false);
            setAppointmentToEdit(null);
            setAppointmentToDelete(appt || appointmentToEdit);
            setIsDeleteAppointmentModalOpen(true);
          }}
        />
      )}

      {/* Task Details Modal (read-only styled like edit form) */}
      {isTaskActionsModalOpen && taskForActions && (
        <TaskDetailsModal
          task={taskForActions}
          onClose={() => {
            setIsTaskActionsModalOpen(false);
            setTaskForActions(null);
          }}
          onEdit={() => handleOpenEditModal(taskForActions.id)}
          onDelete={() => handleDeleteTaskClick(taskForActions.id)}
        />
      )}
    </>
  );
}

export default TasksPage;
