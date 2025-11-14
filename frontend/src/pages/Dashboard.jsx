import React, { useState, useEffect } from "react";
import ProjectCard from "../components/projectCard/ProjectCard";
import CreateProjectForm from "../components/createProject/CreateProject";

const mockProjects = [
  {
    id: 1,
    title: "Projekt A",
    description: "Popis projektu A",
    participants: ["Alice", "Bob"],
    progress: { waiting: 2, inProgress: 3, done: 5 },
  },
  {
    id: 2,
    title: "Projekt B",
    description: "Popis projektu B",
    participants: ["Charlie"],
    progress: { waiting: 1, inProgress: 0, done: 4 },
  },
];

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  return (
    <div>
      <div>
        <h1>Projects</h1>
        <button onClick={handleOpenCreateModal} title="Create Project">
          +
        </button>
      </div>
      {projects.length === 0 ? (
        <div>
          <p>No projects available</p>
        </div>
      ) : (
        <div>
          {projects.map((project) => {
            // Validate project has required fields
            if (!project || !project.id) {
              return null;
            }
            return <ProjectCard key={project.id} project={project} />;
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
    </div>
  );
}

export default Dashboard;
