import { useState, useEffect } from "react";
import ProjectCard from "../components/projectCard/ProjectCard";
import FilterTabs from "../components/filterTabs/FilterTabs";
import ProjectHeader from "../components/ProjectHeader/ProjectHeader";
import ProgressBar from "../components/progressBar/ProgressBar";
import DeleteProjectForm from "../components/forms/DeleteProjectForm";
import CreateProjectForm from "../components/createProject/CreateProject";
import EditProjectForm from "../components/forms/EditProjectForm";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/projectApi";
import styles from "./projectPage.module.css";

/**
 * ProjectPage - Main page for displaying projects grouped by status
 * Handles status cycling: Pending → In Progress → Completed → Pending
 */
function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load projects from API on component mount
   */
  useEffect(() => {
    loadProjects();
  }, []);

  /**
   * Load all projects from backend
   */
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError("Failed to load projects. Please try again later.");
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
   * Handle status change when clicking on ProjectCard
   */
  const handleStatusChange = async (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const newStatus = cycleStatus(project.status);
    const updatedProject = { ...project, status: newStatus };

    try {
      // Update project on backend
      const savedProject = await updateProject(projectId, updatedProject);
      // Update local state
      setProjects((prevProjects) =>
        prevProjects.map((p) => (p.id === projectId ? savedProject : p))
      );
    } catch (err) {
      console.error("Failed to update project status:", err);
      setError("Failed to update project status. Please try again.");
    }
  };

  /**
   * Handle opening delete modal
   */
  const handleOpenDeleteModal = () => {
    // Find the first completed project to show in modal
    const firstCompletedProject = projects.find(
      (p) => p.status === "completed"
    );
    if (firstCompletedProject) {
      setSelectedProject(firstCompletedProject);
      setIsDeleteModalOpen(true);
    }
  };

  /**
   * Handle closing delete modal
   */
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProject(null);
  };

  /**
   * Handle project deletion
   */
  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      // Remove from local state
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId)
      );
      // Close modal
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError("Failed to delete project. Please try again.");
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
   * Handle project creation
   */
  const handleCreateProject = async (newProject) => {
    try {
      // Create project on backend
      const savedProject = await createProject(newProject);
      // Add to local state
      setProjects((prevProjects) => [...prevProjects, savedProject]);
      // Close modal
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Failed to create project. Please try again.");
    }
  };

  /**
   * Handle opening edit modal
   */
  const handleOpenEditModal = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setProjectToEdit(project);
      setIsEditModalOpen(true);
    }
  };

  /**
   * Handle closing edit modal
   */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setProjectToEdit(null);
  };

  /**
   * Handle project update
   */
  const handleUpdateProject = async (updatedProject) => {
    try {
      // Update project on backend
      const savedProject = await updateProject(
        updatedProject.id,
        updatedProject
      );
      // Update local state
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === savedProject.id ? savedProject : project
        )
      );
      // Close modal
      setIsEditModalOpen(false);
      setProjectToEdit(null);
    } catch (err) {
      console.error("Failed to update project:", err);
      setError("Failed to update project. Please try again.");
    }
  };

  /**
   * Group projects by status
   */
  const getProjectsByStatus = () => {
    const inProgressProjects = projects.filter(
      (p) => p.status === "inProgress"
    );
    const pendingProjects = projects.filter((p) => p.status === "pending");
    const completedProjects = projects.filter((p) => p.status === "completed");

    return {
      inProgress: inProgressProjects,
      pending: pendingProjects,
      completed: completedProjects,
    };
  };

  const projectsByStatus = getProjectsByStatus();

  // Calculate total counts for progress bars
  const totalPending = projectsByStatus.pending.length;
  const totalInProgress = projectsByStatus.inProgress.length;
  const totalDone = projectsByStatus.completed.length;

  // Check if there is at least one completed project
  const hasCompleted = projects.some((p) => p.status === "completed");

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading projects...</p>
      </div>
    );
  }

  // Show error state
  if (error && projects.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={loadProjects}>Retry</button>
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
        <ProjectHeader onCreateProject={handleOpenCreateModal} />

        <FilterTabs />

        <main className={styles.main}>
          {/* Pending Section */}
          {projectsByStatus.pending.length > 0 && (
            <section className={styles.section}>
              <ProgressBar
                count={totalPending}
                label="Pending"
                color="yellow"
              />
              {projectsByStatus.pending.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  priorityLabel={project.priority}
                  status={project.status}
                  taskCount={project.taskCount}
                  onStatusChange={() => handleStatusChange(project.id)}
                  onEdit={() => handleOpenEditModal(project.id)}
                />
              ))}
            </section>
          )}

          {/* In Progress Section */}
          {projectsByStatus.inProgress.length > 0 && (
            <section className={styles.section}>
              <ProgressBar
                count={totalInProgress}
                label="In Progress"
                color="purple"
              />
              {projectsByStatus.inProgress.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  priorityLabel={project.priority}
                  status={project.status}
                  taskCount={project.taskCount}
                  onStatusChange={() => handleStatusChange(project.id)}
                  onEdit={() => handleOpenEditModal(project.id)}
                />
              ))}
            </section>
          )}

          {/* Completed Section */}
          {projectsByStatus.completed.length > 0 && (
            <section className={styles.section}>
              <ProgressBar count={totalDone} label="Completed" color="green" />
              {projectsByStatus.completed.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  priorityLabel={project.priority}
                  status={project.status}
                  taskCount={project.taskCount}
                  onStatusChange={() => handleStatusChange(project.id)}
                  onEdit={() => handleOpenEditModal(project.id)}
                />
              ))}
            </section>
          )}
        </main>
      </div>

      {/* Delete Button - Fixed at bottom, only visible if there is at least one completed project */}
      {hasCompleted && (
        <button
          className={styles.deleteButtonStyle}
          onClick={handleOpenDeleteModal}
        >
          Delete
        </button>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <CreateProjectForm
          onClose={handleCloseCreateModal}
          onCreate={handleCreateProject}
        />
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && projectToEdit && (
        <EditProjectForm
          project={projectToEdit}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateProject}
        />
      )}

      {/* Delete Project Modal */}
      {isDeleteModalOpen && selectedProject && (
        <DeleteProjectForm
          project={selectedProject}
          onClose={handleCloseDeleteModal}
          onDelete={handleDeleteProject}
        />
      )}
    </>
  );
}

export default ProjectPage;
