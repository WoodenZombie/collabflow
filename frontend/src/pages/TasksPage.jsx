import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import TaskCard from "../components/taskCard/TaskCard";
import FilterTabs from "../components/filterTabs/FilterTabs";
import TaskHeader from "../components/TaskHeader/TaskHeader";
import ProgressBar from "../components/progressBar/ProgressBar";
import DeleteTaskForm from "../components/forms/DeleteTaskForm";
import CreateTaskForm from "../components/createTask/CreateTask";
import EditTaskForm from "../components/forms/EditTaskForm";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskApi";
import { getProjectById } from "../services/projectApi";
import styles from "./tasksPage.module.css";

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
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectName, setProjectName] = useState("");

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
   * Load tasks from API on component mount or when projectId changes
   */
  useEffect(() => {
    loadTasks();
    if (projectId) {
      loadProjectName();
    }
  }, [projectId]);

  /**
   * Load project name by projectId
   */
  const loadProjectName = async () => {
    try {
      const project = await getProjectById(projectId);
      setProjectName(project.title || project.name || "");
    } catch (err) {
      console.error("Failed to load project name:", err);
      setProjectName("");
    }
  };

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

  /**
   * Load all tasks from backend
   */
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!task) return;

    const newStatus = cycleStatus(task.status);
    const updatedTask = { ...task, status: newStatus };

    try {
      // Update task on backend
      const savedTask = await updateTask(taskId, updatedTask);
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
   * Handle task deletion
   */
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      // Remove from local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      // Remove from filtered tasks
      setFilteredTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );
      // Close modal
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  /**
   * Handle opening create modal
   */
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

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
      // Add projectId to new task if projectId is in URL
      const taskToCreate = projectId
        ? { ...newTask, project_id: parseInt(projectId) }
        : newTask;

      // Create task on backend
      const savedTask = await createTask(taskToCreate);
      // Add to local state
      setTasks((prevTasks) => [...prevTasks, savedTask]);
      // Add to filtered tasks if it matches the current project
      if (
        !projectId ||
        savedTask.project_id === parseInt(projectId) ||
        savedTask.id === projectId
      ) {
        setFilteredTasks((prevTasks) => [...prevTasks, savedTask]);
      }
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
      // Update task on backend
      const savedTask = await updateTask(updatedTask.id, updatedTask);
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

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading tasks...</p>
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
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <TaskHeader
          projectName={projectName}
          onBack={projectId ? () => navigate("/") : null}
          onCreateTask={handleOpenCreateModal}
        />

        <FilterTabs />

        <main className={styles.main}>
          {/* Pending Section */}
          {tasksByStatus.pending.length > 0 && (
            <section className={styles.section}>
              <ProgressBar
                count={totalPending}
                label="Pending"
                color="yellow"
              />
              {tasksByStatus.pending.map((task) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  description={task.description}
                  priorityLabel={task.priority}
                  status={task.status}
                  taskCount={task.taskCount}
                  onStatusChange={() => handleStatusChange(task.id)}
                  onEdit={() => handleOpenEditModal(task.id)}
                />
              ))}
            </section>
          )}

          {/* In Progress Section */}
          {tasksByStatus.inProgress.length > 0 && (
            <section className={styles.section}>
              <ProgressBar
                count={totalInProgress}
                label="In Progress"
                color="purple"
              />
              {tasksByStatus.inProgress.map((task) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  description={task.description}
                  priorityLabel={task.priority}
                  status={task.status}
                  taskCount={task.taskCount}
                  onStatusChange={() => handleStatusChange(task.id)}
                  onEdit={() => handleOpenEditModal(task.id)}
                />
              ))}
            </section>
          )}

          {/* Completed Section */}
          {tasksByStatus.completed.length > 0 && (
            <section className={styles.section}>
              <ProgressBar count={totalDone} label="Completed" color="green" />
              {tasksByStatus.completed.map((task) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  description={task.description}
                  priorityLabel={task.priority}
                  status={task.status}
                  taskCount={task.taskCount}
                  onStatusChange={() => handleStatusChange(task.id)}
                  onEdit={() => handleOpenEditModal(task.id)}
                />
              ))}
            </section>
          )}
        </main>
      </div>

      {/* Delete Button - Fixed at bottom, only visible if there is at least one completed task */}
      {hasCompleted && (
        <button
          className={styles.deleteButtonStyle}
          onClick={handleOpenDeleteModal}
        >
          Delete
        </button>
      )}

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
      {isDeleteModalOpen && selectedTask && (
        <DeleteTaskForm
          task={selectedTask}
          onClose={handleCloseDeleteModal}
          onDelete={handleDeleteTask}
        />
      )}
    </>
  );
}

export default TasksPage;
