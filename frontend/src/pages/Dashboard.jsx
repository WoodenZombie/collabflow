import React, { useState, useEffect } from "react";
import ProjectCard from "../components/projectCard/ProjectCard";
import CreateProjectForm from "../components/createProject/CreateProject";
import EditProjectForm from "../components/editProject/EditProject";
import DeleteProjectForm from "../components/deleteProject/DeleteProject";
import styles from "./dashboard.module.css";

const mockProjects = [
  {
    id: 1,
    title: "Projekt A",
    description: "Popis projektu A",
    startingDate: "12/12/24",
    endingDate: "12/02/25",
    teams: ["Frontend", "Backend"],
    users: [
      { id: "1", name: "Alice", initial: "A" },
      { id: "2", name: "Bob", initial: "B" },
    ],
    participants: ["Alice", "Bob"],
    progress: { waiting: 2, inProgress: 3, done: 5 },
  },
  {
    id: 2,
    title: "Projekt B",
    description: "Popis projektu B",
    startingDate: "01/15/25",
    endingDate: "06/01/25",
    teams: ["QA"],
    users: [{ id: "3", name: "Charlie", initial: "C" }],
    participants: ["Charlie"],
    progress: { waiting: 1, inProgress: 0, done: 4 },
  },
];

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    setProjects(mockProjects);
  }, []);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateProject = (newProject) => {
    // TODO: Add project to backend via API
    // For now, add to local state
    setProjects((prevProjects) => [...prevProjects, newProject]);
    setIsCreateModalOpen(false);
  };

  const handleOpenEditModal = (project) => {
    setProjectToEdit(project);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setProjectToEdit(null);
  };

  const handleUpdateProject = (updatedProject) => {
    // TODO: Update project on backend via API
    // For now, update local state
    setProjects((prevProjects) =>
      prevProjects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    setIsEditModalOpen(false);
    setProjectToEdit(null);
  };

  const handleOpenDeleteModal = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const handleDeleteProject = (projectId) => {
    // TODO: Delete project on backend via API
    // For now, remove from local state
    setProjects((prevProjects) =>
      prevProjects.filter((p) => p.id !== projectId)
    );
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Projects</h1>
        <button onClick={handleOpenCreateModal} className={styles.createButton} title="Create Project">
          +
        </button>
      </div>
      {projects.length === 0 ? (
        <div>
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
                  <button className={`${styles.button} ${styles.edit}`} onClick={() => handleOpenEditModal(project)}>
                  Edit
                </button>
                <button className={`${styles.button} ${styles.delete}`} onClick={() => handleOpenDeleteModal(project)}>
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
