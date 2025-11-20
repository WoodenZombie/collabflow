import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../components/projectCard/ProjectCard";
import CreateProjectForm from "../components/createProject/CreateProject";
import EditProjectForm from "../components/editProject/EditProject";
import DeleteProjectForm from "../components/deleteProject/DeleteProject";
import { getAllProjects, deleteProject, createProject, updateProject } from "../services/projectApi";
import { getAllTasks } from "../services/taskApi";
import styles from "./dashboard.module.css";

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  /**
   * Calculate task progress counts for a project
   * Fetches tasks and groups them by status
   */
  const calculateProjectProgress = useCallback(async (projectId) => {
    try {
      const tasks = await getAllTasks(parseInt(projectId));
      const progress = {
        waiting: 0,
        inProgress: 0,
        done: 0,
      };

      tasks.forEach((task) => {
        if (task.status === "pending") {
          progress.waiting++;
        } else if (task.status === "inProgress") {
          progress.inProgress++;
        } else if (task.status === "completed") {
          progress.done++;
        }
      });

      return progress;
    } catch (err) {
      console.error(`Error calculating progress for project ${projectId}:`, err);
      // Return default progress on error
      return { waiting: 0, inProgress: 0, done: 0 };
    }
  }, []);

  /**
   * Load all projects from backend and calculate progress for each
   */
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all projects
      const projectsData = await getAllProjects();

      // For each project, fetch tasks to calculate progress
      const projectsWithProgress = await Promise.all(
        projectsData.map(async (project) => {
          const progress = await calculateProjectProgress(project.id);
          return {
            ...project,
            progress,
          };
        })
      );

      setProjects(projectsWithProgress);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError("Failed to load projects. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [calculateProjectProgress]);

  /**
   * Load projects on component mount
   */
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateProject = async (newProject) => {
    console.log("handleCreateProject called with newProject:", newProject);
    
    try {
      // Call the API to create the project
      console.log("Calling createProject API");
      const createdProject = await createProject(newProject);
      console.log("Project created successfully:", createdProject);
      
      // Calculate progress for the new project (will be empty initially)
      const progress = await calculateProjectProgress(createdProject.id);
      const projectWithProgress = {
        ...createdProject,
        progress,
      };
      
      // Add the new project to local state immediately (optimistic update)
      setProjects((prevProjects) => [...prevProjects, projectWithProgress]);
      
      // Close modal after successful creation
      setIsCreateModalOpen(false);
      setError(null);
      
      console.log("Project creation completed successfully");
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Failed to create project. Please try again.");
      // Don't close modal on error so user can try again
    }
  };

  const handleOpenEditModal = (project) => {
    setProjectToEdit(project);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setProjectToEdit(null);
  };

  const handleUpdateProject = async (updatedProject) => {
    console.log("handleUpdateProject called with updatedProject:", updatedProject);
    
    if (!updatedProject || !updatedProject.id) {
      console.error("Cannot update project: missing id");
      setError("Cannot update project: missing project ID.");
      return;
    }
    
    try {
      // Call the API to update the project
      console.log("Calling updateProject API with id:", updatedProject.id);
      const savedProject = await updateProject(updatedProject.id, updatedProject);
      console.log("Project updated successfully:", savedProject);
      
      // Calculate progress for the updated project
      const progress = await calculateProjectProgress(savedProject.id);
      const projectWithProgress = {
        ...savedProject,
        progress,
      };
      
      // Update the project in local state
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === savedProject.id.toString() ? projectWithProgress : p
        )
      );
      
      // Close modal after successful update
      setIsEditModalOpen(false);
      setProjectToEdit(null);
      setError(null);
      
      console.log("Project update completed successfully");
    } catch (err) {
      console.error("Failed to update project:", err);
      setError("Failed to update project. Please try again.");
      // Don't close modal on error so user can try again
    }
  };

  const handleOpenDeleteModal = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const handleDeleteProject = async (projectId) => {
    console.log("handleDeleteProject called with projectId:", projectId);
    
    try {
      // Call the API to delete the project
      console.log("Calling deleteProject API with id:", projectId);
      await deleteProject(projectId);
      
      // Remove the project from local state immediately (optimistic update)
      setProjects((prevProjects) =>
        prevProjects.filter((p) => p.id !== projectId.toString())
      );
      
      // Close modal and clear selected project
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      
      console.log("Project deleted successfully");
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError("Failed to delete project. Please try again.");
      // Don't close modal on error so user can try again
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Projects</h1>
        <button
          onClick={handleOpenCreateModal}
          className={styles.createButton}
          title="Create Project"
        >
          +
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ padding: "10px", color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>No projects available</p>
        </div>
      ) : (
        <div className={styles.projectCardContainer}>
          {projects.map((project) => {
            // Validate project has required fields
            if (!project || !project.id) {
              return null;
            }
            return (
              <div key={project.id}>
                <ProjectCard project={project} />
                <div className={styles.projectActions}>
                  <button
                    className={`${styles.button} ${styles.edit}`}
                    onClick={() => handleOpenEditModal(project)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.button} ${styles.delete}`}
                    onClick={() => handleOpenDeleteModal(project)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
      {isDeleteModalOpen && projectToDelete && (
        <DeleteProjectForm
          project={projectToDelete}
          onClose={handleCloseDeleteModal}
          onDelete={handleDeleteProject}
        />
      )}
    </div>
  );
}

export default Dashboard;
