import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import TaskCard from "../components/taskCard/TaskCard";
import FilterTabs from "../components/filterTabs/FilterTabs";
import TaskHeader from "../components/TaskHeader/TaskHeader";
import ProgressBar from "../components/progressBar/ProgressBar";
import DeleteTaskForm from "../components/forms/DeleteTaskForm";
import CreateTaskForm from "../components/createTask/CreateTask";
import EditTaskForm from "../components/forms/EditTaskForm";
import CreateAppointmentForm from "../components/createAppointment/CreateAppointment";
import AppointmentList from "../components/appointmentList/AppointmentList";
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
} from "../services/appointmentApi";
import { getProjectById, updateProject as updateProjectApi, deleteProject as deleteProjectApi } from "../services/projectApi";
import styles from "./tasksPage.module.css";

import TeamCard from "../components/teamCard/TeamCard";
import TeamForm from "../components/forms/TeamForm";
import {
  getTeamsByProject,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../services/teamApi";
import { getAllUsers } from "../services/userApi";
import DeleteTeamForm from "../components/forms/DeleteTeamForm";
import DeleteAppointmentModal from "../components/DeleteAppoinment/DeleteAppoinmentModal";
import DeleteTaskModal from "../components/deleteTaskModule/deleteTaskModule";
import EditProjectForm from "../components/editProject/EditProject";
import DeleteProjectForm from "../components/deleteProject/DeleteProject";
// Using native HTML5 Drag and Drop instead of external library

/**
 * TasksPage - Main page for displaying tasks grouped by status
 * Handles status cycling: Pending → In Progress → Completed → Pending
 * Can filter tasks by projectId if provided in URL
 */
function TasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateAppointmentModalOpen, setIsCreateAppointmentModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isTaskActionsModalOpen, setIsTaskActionsModalOpen] = useState(false);
  const [taskForActions, setTaskForActions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('byTotalTasks');
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

  // Add state for delete appointment modal
  const [isDeleteAppointmentModalOpen, setIsDeleteAppointmentModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

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
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      // Only set error if we're on appointments tab
      if (activeFilter === 'appointments') {
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
  useEffect(() => {
    loadTasks();
    loadAppointments();
    loadProjectName();
  }, [loadTasks, loadAppointments, loadProjectName]);

  /**
   * Filter tasks by projectId when tasks or projectId changes
   */
  useEffect(() => {
    if (projectId) {
      // Filter tasks by projectId
      // Since API returns projects as tasks, we filter by matching id
      // Also check for project_id in case real tasks are returned
      const filtered = tasks.filter((task) => {
        const taskId = task.id?.toString();
        const taskProjectId = task.project_id?.toString();
        const projectIdStr = projectId.toString();

        // Match if task.id equals projectId (when API returns projects as tasks)
        // OR if task.project_id equals projectId (when API returns actual tasks)
        return taskId === projectIdStr || taskProjectId === projectIdStr;
      });
      setFilteredTasks(filtered);
    } else {
      // If no projectId, show all tasks
      setFilteredTasks(tasks);
    }
  }, [tasks, projectId]);

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
    const task = tasks.find(t => t.id === taskId);
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
      setFilteredTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      
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
      // Create task on backend
      const savedTask = await createTask(projectIdNum, newTask);
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
      setTaskForActions(null);
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
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      setAppointmentToDelete(appointment);
      setIsDeleteAppointmentModalOpen(true);
    }
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

  /**
   * Group tasks by status
   */
  const getTasksByStatus = () => {
    const inProgressTasks = filteredTasks.filter(
      (t) => t.status === "inProgress"
    );
    const pendingTasks = filteredTasks.filter((t) => t.status === "pending");
    const completedTasks = filteredTasks.filter(
      (t) => t.status === "completed"
    );

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

  const handleCreateTeam = async (teamData) => {
    const newTeam = await createTeam({ ...teamData, projectId });
    setTeams((prev) => [...prev, newTeam]);
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
      setFilteredTasks((prev) => prev.map((t) => (t.id === taskId ? savedTask : t)));
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
  <div className={styles.pageContainer} style={{ fontFamily: "Arial, sans-serif" }}>
        <TaskHeader
          projectName={projectName}
          onBack={projectId ? () => navigate("/") : null}
          onCreateTask={handleHeaderAddClick}
          onCreateAppointment={handleOpenCreateAppointmentModal}
          onCreateTeam={handleCreateTeamClick}
          onEditProject={openEditProject}
          onDeleteProject={openDeleteProject}
        />

        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* Appointments Section - Only show when Appointments tab is active */}
        {activeFilter === 'appointments' && (
          <div style={{ marginBottom: "30px" }}>
            <AppointmentList
              appointments={appointments}
              onDelete={handleDeleteAppointment}
              isLoading={isLoadingAppointments}
            />
          </div>
        )}

        {/* Tasks Section - Only show when By Total Tasks tab is active */}
        {activeFilter === 'byTotalTasks' && (
          <main className={styles.main}>
            {/* Pending Section (static) */}
            <section
              className={styles.section}
              onDragOver={allowDrop}
              onDrop={() => handleDropToStatus('pending')}
            >
              <ProgressBar count={totalPending} label="Pending" color="yellow" />
              {tasksByStatus.pending.length === 0 && (
                <p style={{ color: '#777', fontStyle: 'italic' }}>No tasks</p>
              )}
              {tasksByStatus.pending.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  style={{ cursor: 'grab' }}
                >
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    priorityLabel={task.priority}
                    status={task.status}
                    taskCount={task.taskCount}
                    responsiblePerson={task.responsiblePerson || task.assigned_to || task.assignee || (task.user && task.user.name)}
                    endDate={task.endDate || task.due_date || task.deadline || task.endingDate}
                    onClick={() => openTaskActions(task)}
                  />
                </div>
              ))}
            </section>

            {/* In Progress Section (static) */}
            <section
              className={styles.section}
              onDragOver={allowDrop}
              onDrop={() => handleDropToStatus('inProgress')}
            >
              <ProgressBar count={totalInProgress} label="In Progress" color="purple" />
              {tasksByStatus.inProgress.length === 0 && (
                <p style={{ color: '#777', fontStyle: 'italic' }}>No tasks</p>
              )}
              {tasksByStatus.inProgress.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  style={{ cursor: 'grab' }}
                >
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    priorityLabel={task.priority}
                    status={task.status}
                    taskCount={task.taskCount}
                    responsiblePerson={task.responsiblePerson || task.assigned_to || task.assignee || (task.user && task.user.name)}
                    endDate={task.endDate || task.due_date || task.deadline || task.endingDate}
                    onClick={() => openTaskActions(task)}
                  />
                </div>
              ))}
            </section>

            {/* Completed Section (static) */}
            <section
              className={styles.section}
              onDragOver={allowDrop}
              onDrop={() => handleDropToStatus('completed')}
            >
              <ProgressBar count={totalDone} label="Completed" color="green" />
              {tasksByStatus.completed.length === 0 && (
                <p style={{ color: '#777', fontStyle: 'italic' }}>No tasks</p>
              )}
              {tasksByStatus.completed.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  style={{ cursor: 'grab' }}
                >
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    priorityLabel={task.priority}
                    status={task.status}
                    taskCount={task.taskCount}
                    responsiblePerson={task.responsiblePerson || task.assigned_to || task.assignee || (task.user && task.user.name)}
                    endDate={task.endDate || task.due_date || task.deadline || task.endingDate}
                    onClick={() => openTaskActions(task)}
                  />
                </div>
              ))}
            </section>
          </main>
        )}

        {/* Teams Section - Only show when Teams tab is active */}
        {activeFilter === 'teams' && (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {teams.length === 0 && !isLoading ? (
              <p>No teams found for this project.</p>
            ) : (
              teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  allUsers={allUsers}
                  onEdit={(t) => {
                    setTeamToEdit(t);
                    setIsTeamModalOpen(true);
                  }}
                  onDelete={() => handleDeleteTeamClick(team)}
                />
              ))
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
        />
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && taskToEdit && (
        <EditTaskForm
          task={taskToEdit}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateTask}
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

      {/* Delete Appointment Modal */}
      {isDeleteAppointmentModalOpen && appointmentToDelete && (
        <DeleteAppointmentModal
          appointment={appointmentToDelete}
          onClose={() => {
            setIsDeleteAppointmentModalOpen(false);
            setAppointmentToDelete(null);
          }}
          onDelete={confirmDeleteAppointment}
        />
      )}

      {/* Task Actions Modal */}
      {isTaskActionsModalOpen && taskForActions && (
        <div onClick={() => {setIsTaskActionsModalOpen(false); setTaskForActions(null);}} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background:'#fff', borderRadius:12, padding:20, width:'min(420px, 90vw)', boxShadow:'0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ margin:0 }}>{taskForActions.title || 'Task'}</h3>
              <button onClick={() => {setIsTaskActionsModalOpen(false); setTaskForActions(null);}} style={{ border:'none', background:'transparent', fontSize:20, lineHeight:1, cursor:'pointer' }}>×</button>
            </div>
            <p style={{ color:'#555', marginTop:8 }}>{taskForActions.description || 'Description: Not provided'}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 16px', marginTop:12 }}>
              <div><strong>Priority:</strong> {taskForActions.priority || 'Not provided'}</div>
              <div><strong>Status:</strong> {taskForActions.status || 'Not provided'}</div>
              <div><strong>Subtasks:</strong> {typeof taskForActions.taskCount === 'number' ? taskForActions.taskCount : 'Not provided'}</div>
              <div><strong>Responsible:</strong> {taskForActions.responsiblePerson || taskForActions.assigned_to || taskForActions.assignee || (taskForActions.user && taskForActions.user.name) || 'Not provided'}</div>
              <div><strong>End date:</strong> {(() => { const raw = taskForActions.endDate || taskForActions.due_date || taskForActions.deadline || taskForActions.endingDate; if (!raw) return 'Not provided'; const d = new Date(raw); if (isNaN(d.getTime())) return 'Not provided'; const dd = String(d.getDate()).padStart(2, '0'); const mm = String(d.getMonth()+1).padStart(2, '0'); const yyyy = d.getFullYear(); const hh = String(d.getHours()).padStart(2, '0'); const min = String(d.getMinutes()).padStart(2, '0'); return `${dd}.${mm}.${yyyy} ${hh}:${min}`; })()}</div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:16 }}>
              <button onClick={() => handleOpenEditModal(taskForActions.id)} style={{ padding:'10px 16px', borderRadius:8, border:'1px solid #888' }}>Edit</button>
              <button onClick={() => handleDeleteTaskClick(taskForActions.id)} style={{ padding:'10px 16px', borderRadius:8, background:'#e53935', color:'#fff', border:'none' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TasksPage;
